<template>
    <div class="books-container">
      <b-container class="mt-3">
      <b-row align-h="between">
        <b-col sm="12" md="9">
          <b-input-group class="mb-3">
            <b-form-input v-model="searchTerm" placeholder="Search books..." />
          </b-input-group>
        </b-col>
        <b-col class="text-right">
          <b-button variant="primary" @click="showAddModal">Add Book</b-button>
        </b-col>
      </b-row>
    </b-container>

    <b-container class="mt-3">
      <b-table
        :items="books"
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
        @row-clicked="showEditModal"
        responsive
      >
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

    <!-- Add Book Modal -->
    <b-modal v-model="addModalVisible" title="Add Book">
      <b-form @submit="addBook">
        <b-form-group label="Name">
          <b-form-input v-model="bookForm.name" required />
        </b-form-group>
        <b-form-group label="Number of Pages">
          <b-form-input type="number" v-model="bookForm.pages" required />
        </b-form-group>
        <b-form-group label="Author">
          <b-form-select
              id="author-input"
              v-model="bookForm.author"
              :options="authors"
              required
            ></b-form-select>
        </b-form-group>
      </b-form>
    </b-modal>

    <!-- Edit Book Modal -->
    <b-modal v-model="editModalVisible" title="Edit Book">
      <b-form @submit="saveBook">
        <b-form-group label="Name">
          <b-form-input v-model="bookForm.name" required />
        </b-form-group>
        <b-form-group label="Number of Pages">
          <b-form-input type="number" v-model="bookForm.pages" required />
        </b-form-group>
        <b-form-group label="Author">
          <b-form-select
              id="author-input"
              v-model="bookForm.author"
              :options="authors"
              required
            ></b-form-select>
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
            books: [],
            fields: [
                { key: 'name', label: 'Name' },
                { key: 'author', label: 'Author Name' },
                { key: 'page_numbers', label: 'Number of Pages' }
            ],
            searchTerm: '',
            addModalVisible: false,
            editModalVisible: false,
            bookForm: {
                name: '',
                pages: '',
                author: null
            },
            perPage: 5,
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
            isBusy: true,
        };
    },
    mounted() {
        this.fetchBooks();
    },
    methods: {
        async fetchBooks() {
            try {
                const response = await axios.get('http://localhost:8000/books');
                this.books = response.data;
                this.totalRows = this.books.length;
                this.isBusy = !this.isBusy
            } catch (error) {
                console.error(error);
            }
        },
        showAddModal() {
            this.addModalVisible = true
            this.bookForm = {
                name: '',
                pages: null,
                author: null
            };
        },
        showEditModal(book) {
            this.editModalVisible = true
            this.bookForm = {
                name: book.name,
                pages: book.page_numbers,
                author: book.id
            };
        },
        addBook() {
            this.createBook(this.bookForm)
            this.addModalVisible = false
            this.bookForm = {
                name: '',
                pages: '',
                author: null
            }
        },
        saveBook() {
            this.editModalVisible = false
        }
    },
};
</script>
  
<style scoped>
.books-container {
    margin-top: 2rem;
}
</style>
