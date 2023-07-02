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
        :busy="authorsIsBusy"
        responsive
        @row-clicked="showEditModal"
      >
        <template #table-busy>
          <div class="text-center text-danger my-2">
            <b-spinner class="align-middle"></b-spinner>
          </div>
        </template>
      </b-table>
      <b-pagination v-model="currentPage" :total-rows="authorsTotalRows" :per-page="perPage" size="sm" class="my-0">
      </b-pagination>
    </b-container>

    <!-- Add Author Modal -->
    <b-modal v-model="addModalVisible" title="Add Author" hide-footer>
      <b-form @submit.prevent="addAuthor">
        <b-form-group label="Name">
          <b-form-input v-model="authorForm.name" required />
        </b-form-group>
        <b-button variant="secondary" @click="addModalVisible = false">Cancel</b-button>
        <b-button type="submit" variant="primary">OK</b-button>
      </b-form>
    </b-modal>

    <!-- Edit Author Modal -->
    <b-modal v-model="editModalVisible" title="Edit Author" hide-footer>
      <b-form @submit.prevent="saveAuthor">
        <b-form-group label="Name">
          <b-form-input v-model="authorForm.name" required />
        </b-form-group>

        <b-container>
          <b-row>
            <b-col class="mt-4">
              <h5>Books:</h5>
            </b-col>
            <b-col class="text-right my-3">
              <b-button size="sm" @click="showAddBookModal">Add Book</b-button>
            </b-col>
          </b-row>
        </b-container>

        <b-table :items="booksData" :fields="bookFields" hover hide-footer>
          <template v-slot:cell(actions)="data">
            <b-button size="sm" @click="editBook(data.item)">Edit</b-button>
            <b-button size="sm" variant="danger" @click="deleteBook(data.item)">Delete</b-button>
          </template>
        </b-table>

        <b-button variant="secondary" @click="editModalVisible = false">Cancel</b-button>
        <b-button type="submit" variant="primary">OK</b-button>
      </b-form>
    </b-modal>

    <!-- Edit Book Modal -->
    <b-modal v-model="editBookModalVisible" title="Edit Book" hide-footer>
      <b-form @submit.prevent="saveBook">
        <b-form-group label="Name">
          <b-form-input v-model="bookForm.name" required />
        </b-form-group>
        <b-form-group label="Number of Pages">
          <b-form-input type="number" v-model="bookForm.page_numbers" required />
        </b-form-group>
        <b-button variant="secondary" @click="editBookModalVisible = false">Cancel</b-button>
        <b-button type="submit" variant="primary">OK</b-button>
      </b-form>
    </b-modal>

    <!-- Add Book Modal -->
    <b-modal v-model="addBookModalVisible" title="Add Book" hide-footer>
      <b-form @submit.prevent="addNewBook">
        <b-form-group label="Name">
          <b-form-input v-model="bookForm.name" required />
        </b-form-group>
        <b-form-group label="Number of Pages">
          <b-form-input type="number" v-model="bookForm.page_numbers" required />
        </b-form-group>
        <b-button variant="secondary" @click="addBookModalVisible = false">Cancel</b-button>
        <b-button type="submit" variant="primary">OK</b-button>
      </b-form>
    </b-modal>
  </div>
</template>
  
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';

export default {
  data() {
    return {
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'book_count', label: 'Number of Books' },
      ],
      bookFields: [
        { key: 'name', label: 'Name' },
        { key: 'page_numbers', label: 'Number of Pages' },
        { key: 'actions', label: 'Actions' },
      ],
      searchTerm: '',
      addModalVisible: false,
      editModalVisible: false,
      editBookModalVisible: false,
      addBookModalVisible: false,
      authorForm: {
        id: null,
        name: '',
      },
      selectedAuthor: null,
      selectedBook: null,
      bookForm: {
        id: null,
        name: '',
        page_numbers: null,
        author_id: null,
        author: '',
        books: [],
      },
      perPage: 3,
      currentPage: 1,
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
      createdLastBookInfo: [],
    };
  },
  computed: {
    ...mapGetters(['books', 'authors', 'authorsTotalRows', 'authorsIsBusy']),
    ...mapMutations(['setBooks', 'setAuthors']),
  },
  async mounted() {
    try {
      const { authors, authorsTotalRows, authorsIsBusy } = await this.fetchAuthors();
    } catch (error) {
      console.error(error);
    }
  },
  methods: {
    ...mapActions(['fetchBooks', 'fetchAuthors', 'addAuthor', 'addBook', 'updateBook', 'updateAuthor', 'deleteBook']),
    showAddModal() {
      this.addModalVisible = true;
      this.authorForm = {
        id: null,
        name: '',
      };
    },
    showEditModal(author) {
      this.editModalVisible = true;
      this.authorForm = {
        id: author.id,
        name: author.name,
      };
      this.booksData = author.books.map((book) => {
        return {
          id: book.id,
          name: book.name,
          page_numbers: book.page_numbers,
        };
      });
      this.booksData.map((b) => {
        this.bookForm = {
          id: b.id,
          name: b.name,
          page_numbers: b.page_numbers,
        };
      });
    },
    showAddBookModal() {
      this.addBookModalVisible = true;
      this.bookForm = {
        id: null,
        name: null,
        page_numbers: null,
        author_id: null,
        author: null,
      };
    },
    addAuthor() {
      this.$store.dispatch('addAuthor', this.authorForm);
      this.addModalVisible = false;
      this.authorForm = {
        id: null,
        name: '',
      };
    },
    saveAuthor() {
      this.$store.dispatch('updateAuthor', this.authorForm);
      this.editModalVisible = false;
      this.selectedAuthor = null;
    },
    editBook(book) {
      this.editBookModalVisible = true;
      this.bookForm = {
        id: book.id,
        name: book.name,
        page_numbers: book.page_numbers,
        author_id: book.author_id,
        author: book.author,
      };
    },
    deleteBook(book) {
      this.$store.dispatch('deleteBook', book);
    },
    async saveBook() {
      this.bookForm.page_numbers = parseInt(this.bookForm.page_numbers);

      const updatedBook = {
        id: this.bookForm.id,
        name: this.bookForm.name,
        page_numbers: this.bookForm.page_numbers,
        author_id: this.authorForm.id,
        author: this.authorForm.name,
      };

      this.$store.dispatch('updateBook', updatedBook);
      this.editBookModalVisible = false;
    },
    async addNewBook() {
      const { totalRows } = await this.fetchBooks();

      const newBookId = totalRows + 1;

      const createdBook = {
        id: newBookId,
        name: this.bookForm.name,
        page_numbers: this.bookForm.page_numbers,
        author_id: this.authorForm.id,
        author: this.authorForm.name,
      };

      this.$store.dispatch('addBook', createdBook);
      this.addBookModalVisible = false;
      this.bookForm = {
        name: '',
        pages: '',
      };
    },
  },
};
</script>

<style scoped>
.author-container {
  margin-top: 2rem;
}
</style>
