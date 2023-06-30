import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

Vue.use(Vuex)

const store = () => {
    return new Vuex.Store({
        state: {
            books: [],
            authors: [],
            totalRows: 1,
            isBusy: true,
        },
        getters: {
            books: state => state.books,
            authors: state => state.authors,
            totalRows: state => state.totalRows,
            isBusy: state => state.isBusy
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
            setIsBusy(state, isBusy) {
                state.isBusy = isBusy
            },
            addBook(state, book) {
                state.books.push(book);
            },
            updateBook(state, updatedBook) {
                const index = state.books.findIndex(book => book.id === updatedBook.id);
                if (index !== -1) {
                    Vue.set(state.books, index, updatedBook);
                }
            },
            deleteBook(state, bookId) {
                state.books = state.books.filter(book => book.id !== bookId);
            },
        },
        actions: {
            async fetchBooks({ commit }) {
                try {
                    const response = await axios.get('http://localhost:8000/books');
                    const books = response.data;
                    console.log("DATA: ", books)
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
                    console.log("AU DATA: ", authors)
                    commit('setAuthors', authors);
                    // return this.state.authors;
                    return { authors }
                } catch (error) {
                    console.error(error);
                }
            },
            async createBook({ commit }, book) {
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
                    await axios.put(`http://localhost:8000/books/${book.id}`, book);
                    commit('updateBook', book);
                } catch (error) {
                    console.error(error);
                }
            },
            async deleteBook({ commit }, bookId) {
                try {
                    await axios.delete(`http://localhost:8000/books/${bookId}`);
                    commit('deleteBook', bookId);
                } catch (error) {
                    console.error(error);
                }
            },
        }
    });
};

export default store;
