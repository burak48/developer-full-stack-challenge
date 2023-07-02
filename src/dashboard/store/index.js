import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

Vue.use(Vuex)

const store = () => {
    return new Vuex.Store({
        state: {
            books: [],
            totalRows: 1,
            isBusy: true,
            authors: [],
            authorsTotalRows: 1,
            authorsIsBusy: true,
        },
        getters: {
            books: state => state.books,
            authors: state => state.authors,
            totalRows: state => state.totalRows,
            isBusy: state => state.isBusy,
            authorsTotalRows: state => state.authorsTotalRows,
            authorsIsBusy: state => state.authorsIsBusy,
        },
        mutations: {
            setBooks(state, books) {
                state.books = books
            },
            setAuthors(state, authors) {
                state.authors = authors
            },
            setTotalRows(state, totalRows) {
                state.totalRows = totalRows
            },
            setAuthorsTotalRows(state, authorsTotalRows) {
                state.authorsTotalRows = authorsTotalRows
            },
            setAuthorsIsBusy(state, authorsIsBusy) {
                state.authorsIsBusy = authorsIsBusy
            },
            setIsBusy(state, isBusy) {
                state.isBusy = isBusy
            },
            addBook(state, book) {
                state.books.push(book);

                // Trigger reactivity using Vue.set
                Vue.set(state, 'books', [...state.books]);
            },
            updateBook(state, updatedBook) {
                const index = state.books.findIndex(book => book.id === updatedBook.id);
                if (index !== -1) {
                    Vue.set(state.books, index, updatedBook);
                }
            },
            deleteBook(state, bookId) {
                const index = state.books.findIndex((book) => book.id === bookId);
                if (index !== -1) {
                    Vue.set(state.books, index, null);
                    state.books.splice(index, 1);
                }
            },
            addAuthor(state, author) {
                state.authors.push(author);

                // Trigger reactivity using Vue.set
                Vue.set(state, 'authors', [...state.authors]);
            },
            updateAuthor(state, updatedAuthor) {
                const index = state.authors.findIndex(author => author.id === updatedAuthor.id);
                if (index !== -1) {
                    Vue.set(state.authors, index, updatedAuthor);
                }
            },
        },
        actions: {
            async fetchBooks({ commit }) {
                try {
                    const response = await axios.get('http://localhost:8000/books');
                    const books = response.data;
                    commit('setBooks', books);
                    const totalRows = books.length;
                    commit('setTotalRows', totalRows);
                    // const isBusy = !this.state.isBusy;
                    const isBusy = false;
                    commit('setIsBusy', isBusy);
                    // return this.state.books;
                    return { books, totalRows, isBusy };
                } catch (error) {
                    console.error(error);
                }
            },
            async fetchAuthors({ commit }) {
                try {
                    const response = await axios.get('http://localhost:8000/authors');
                    const authors = response.data;
                    commit('setAuthors', authors);
                    const authorsTotalRows = authors.length;
                    commit('setAuthorsTotalRows', authorsTotalRows);
                    const authorsIsBusy = false;
                    commit('setAuthorsIsBusy', authorsIsBusy);
                    return { authors, authorsTotalRows, authorsIsBusy };
                } catch (error) {
                    console.error(error);
                }
            },
            async addBook({ commit }, book) {
                try {
                    const response = await axios.post('http://localhost:8000/books', book);
                    const createdBook = response.data;
                    commit('addBook', createdBook);
                } catch (error) {
                    console.error(error);
                }
            },
            async updateBook({ commit }, book) {
                try {
                    const response = await axios.put(`http://localhost:8000/books/${book.id}`, book);
                    const updatedBook = response.data;
                    commit('updateBook', updatedBook);
                } catch (error) {
                    console.error(error);
                }
            },
            async deleteBook({ commit }, book) {
                try {
                    const response = await axios.delete(`http://localhost:8000/books/${book.id}`);
                    commit('deleteBook', book.id);
                } catch (error) {
                    console.error(error);
                }
            },
            async addAuthor({ commit }, author) {
                try {
                    const response = await axios.post('http://localhost:8000/authors', author);
                    const createdAuthor = response.data;
                    commit('addAuthor', createdAuthor);
                } catch (error) {
                    console.error(error);
                }
            },
            async updateAuthor({ commit }, author) {
                try {
                    const response = await axios.put(`http://localhost:8000/authors/${author.id}`, author);
                    const updatedAuthor = response.data;
                    commit('updateAuthor', updatedAuthor);
                } catch (error) {
                    console.error(error);
                }
            },
        }
    });
};

export default store;
