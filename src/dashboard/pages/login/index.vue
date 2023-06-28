<template>
    <div class="login-container">
        <b-container>
            <b-row class="justify-content-center">
                <b-col md="6" sm="8">
                    <b-card title="Login" class="mt-5">
                        <b-form @submit.prevent="submitForm">
                            <b-form-group label="Username" label-for="username">
                                <b-form-input id="username" v-model="username" required></b-form-input>
                            </b-form-group>
                            <b-form-group label="Password" label-for="password">
                                <b-form-input id="password" v-model="password" type="password" required></b-form-input>
                            </b-form-group>
                            <b-button type="submit" variant="primary" block>Login</b-button>
                        </b-form>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            username: "",
            password: ""
        };
    },
    methods: {
        async submitForm() {
            axios.post('http://localhost:8000/login', {
                username: this.username,
                password: this.password,
            })
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.b-card {
    max-width: 400px;
    margin: 0 auto;
}
</style>
