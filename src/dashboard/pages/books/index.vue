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
      <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" size="sm" class="my-0">
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
          <treeselect
            v-model="author"
            :multiple="false"
            :options="authorOptions"
            :clearable="true"
            placeholder="Select an author"
          >
          </treeselect>
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
          <treeselect
            v-model="bookForm.author"
            :multiple="false"
            :options="authorOptions"
            :clearable="true"
            placeholder="Select an author"
          >
          </treeselect>
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>
  
<script>
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import { mapGetters, mapActions, mapMutations  } from 'vuex';

export default {
  components: {
    Treeselect,
  },
  computed: {
    ...mapGetters(['books', 'authors', 'totalRows', 'isBusy']),
    ...mapMutations(['setBooks']),
    authorOptions() {
      return this.authors.map(author => ({
        id: author.id,
        label: author.name
      }));
    },
  },
  data() {
    return {
      value: [],
      searchTerm: '',
      addModalVisible: false,
      editModalVisible: false,
      bookForm: {
        name: '',
        pages: '',
        author: null,
      },
      perPage: 5,
      currentPage: 1,
      sortBy: '',
      sortDesc: false,
      bordered: true,
      outlined: true,
      hover: true,
      fixed: true,
      noCollapse: true,
      headVariant: 'dark',
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'author', label: 'Author Name' },
        { key: 'page_numbers', label: 'Number of Pages' },
      ],
    };
  },
  async mounted() {
    try {
      // await this.fetchBooks();
      const { books, totalRows, isBusy } = await this.fetchBooks();
      console.log('BOOKS: ', books);
      console.log('totalRows: ', totalRows);
      console.log('isBusy: ', isBusy);
      const { authors } = await this.fetchAuthors();
      console.log("AUTHORS: ", authors)
    } catch (error) {
      console.error(error);
    }
  },
  methods: {
    ...mapActions(['fetchBooks', 'fetchAuthors', 'createBook', 'updateBook']),
    showAddModal() {
      this.addModalVisible = true;
      this.bookForm = {
        name: '',
        pages: null,
        author: null,
      };
    },
    showEditModal(book) {
      this.editModalVisible = true;
      console.log("book: ", book)
      this.bookForm = {
        name: book.name,
        pages: book.page_numbers,
        author: book.id,
      };
    },
    async addBook() {
      this.createBook(this.bookForm).then(() => {
        this.setBooks();
      });
      this.addModalVisible = false;
      this.bookForm = {
        name: '',
        pages: '',
        author: null,
      };
      // const createdBook = await this.createBook(this.bookForm);
      // console.log("CREATEDBOOK FS:", createdBook)
      // if (createdBook) {
      //   console.log('Created Book:', createdBook);
      //   this.addModalVisible = false;
      //   this.bookForm = {
      //     name: '',
      //     pages: '',
      //     author: null,
      //   };
      // } else {
      //   console.error('Failed to create book');
      // }
    },
    saveBook() {
      this.editModalVisible = false;
      this.updateBook(this.bookForm).then(() => {
        this.setBooks();
      });
    },
  },
};
</script>
  
<style scoped>
.books-container {
  margin-top: 2rem;
}
</style>
