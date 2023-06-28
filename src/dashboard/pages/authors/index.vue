<template>
    <div class="author-container">
        <b-container class="mt-3">
            <b-row align-h="between">
                <b-col sm="12" md="9">
                    <b-input-group class="mb-3">
                        <b-form-input v-model="searchTerm" placeholder="Search authors..." />
                    </b-input-group>
                </b-col>
                <b-col class="text-right">
                    <b-button variant="primary" @click="showAddModal">Add Author</b-button>
                </b-col>
            </b-row>
        </b-container>

        <b-container class="mt-3">
            <b-table 
                :items="authors"
                :fields="fields"
                :current-page="currentPage"
                :per-page="perPage"
                :filter="searchTerm"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :bordered="bordered"
                :outlined="outlined"
                :hover="hover"
                :fixed="fixed"
                :no-border-collapse="noCollapse"
                :head-variant="headVariant"
                :busy="isBusy"
                responsive
                @row-clicked="showEditModal">
                <template #table-busy>
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle"></b-spinner>
                    </div>
                </template>
            </b-table>
            <b-pagination 
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPage"
                size="sm"
                class="my-0">
            </b-pagination>
        </b-container>

        <!-- Add Author Modal -->
        <b-modal v-model="addModalVisible" title="Add Author">
        <b-form @submit="addAuthor">
          <b-form-group label="Name">
            <b-form-input v-model="authorForm.name" required />
          </b-form-group>
        </b-form>
      </b-modal>

        <!-- Edit Author Modal -->
        <b-modal v-model="editModalVisible" title="Edit Author">
        <b-form @submit="saveAuthor">
          <b-form-group label="Name">
            <b-form-input v-model="authorForm.name" required />
          </b-form-group>
  
          <h5>Books:</h5>
          <b-table :items="booksData" :fields="bookFields" hover>
            <template v-slot:cell(actions)="data">
                <b-button size="sm" @click="editBook(data.item)">Edit</b-button>
                <b-button size="sm" @click="deleteBook(data.item)">Delete</b-button>
            </template>
          </b-table>
          <b-button size="sm" @click="addBook">Add Book</b-button>
        </b-form>
      </b-modal>

        <!-- Edit Book Modal -->
        <b-modal v-model="editBookModalVisible" title="Edit Book">
        <b-form @submit="saveBook">
          <b-form-group label="Name">
            <b-form-input v-model="bookForm.name" required />
          </b-form-group>
          <b-form-group label="Number of Pages">
            <b-form-input type="number" v-model="bookForm.pages" required />
          </b-form-group>
        </b-form>
      </b-modal>

        <!-- Add Book Modal -->
        <b-modal v-model="addBookModalVisible" title="Add Book">
        <b-form @submit="addNewBook">
          <b-form-group label="Name">
            <b-form-input v-model="bookForm.name" required />
          </b-form-group>
          <b-form-group label="Number of Pages">
            <b-form-input type="number" v-model="bookForm.pages" required />
          </b-form-group>
        </b-form>
      </b-modal>
    </div>
</template>
  
<script>
import axios from 'axios';

export default {
    data() {
        return {
            authors: [],
            fields: [
                { key: 'name', label: 'Name' },
                { key: 'book_count', label: 'Number of Books' }
            ],
            bookFields: [
                { key: 'name', label: 'Name' },
                { key: 'page_numbers', label: 'Number of Pages' },
                { key: 'actions', label: 'Actions' }
            ],
            searchTerm: '',
            addModalVisible: false,
            editModalVisible: false,
            editBookModalVisible: false,
            addBookModalVisible: false,
            authorForm: {
                name: ''
            },
            selectedAuthor: null,
            selectedBook: null,
            bookForm: {
                name: '',
                pages: '',
                books: []
            },
            perPage: 3,
            currentPage: 1,
            totalRows: 1,
            sortBy: '',
            sortDesc: false,
            bordered: true,
            outlined: true,
            hover: true,
            fixed: true,
            headVariant: 'dark',
            noCollapse: true,
            pagination: true,
            booksData: [],
            isBusy: true,
        }
    },
    methods: {
        async fetchAuthors() {
            try {
                const response = await axios.get('http://localhost:8000/authors');
                this.authors = response.data;
                this.totalRows = this.authors.length;
                this.isBusy = !this.isBusy
            } catch (error) {
                console.error(error);
            }
        },
        showAddModal() {
            this.addModalVisible = true
            this.authorForm = {
                name: ''
            };
        },
        showEditModal(author) {
            this.editModalVisible = true
            this.authorForm = {
                name: author.name
            }

            this.booksData = author.books.map(book => {
                return {
                    name: book.name,
                    page_numbers: book.page_numbers
                }
            })
            this.booksData.map((b) => {
                this.bookForm = {
                    name: b.name,
                    page_numbers: b.page_numbers
                };
            })
        },
        addAuthor() {
            this.createAuthor(this.authorForm)
            this.addModalVisible = false
            this.authorForm = {
                name: ''
            }
        },
        saveAuthor() {
            this.editModalVisible = false
            this.selectedAuthor = null
        },
        editBook(book) {
            this.editBookModalVisible = true
            this.bookForm = {
                name: book.name,
                pages: book.page_numbers,
                author: book.id
            };
        },
        deleteBook(book) {
            const index = this.selectedAuthor.books.indexOf(book)
            this.selectedAuthor.books.splice(index, 1)
        },
        saveBook() {
            this.editBookModalVisible = false
            this.selectedBook = null
        },
        addBook() {
            this.addBookModalVisible = true
            this.bookForm = {
                name: '',
                pages: '',
                author: null
            }
        },
        addNewBook() {
            this.selectedAuthor.books.push({ ...this.bookForm })
            this.addBookModalVisible = false
            this.bookForm = {
                name: '',
                pages: ''
            }
        }
    },
    mounted() {
        this.fetchAuthors()
    }
}
</script>

<style scoped>
.author-container {
    margin-top: 2rem;
}
</style>
