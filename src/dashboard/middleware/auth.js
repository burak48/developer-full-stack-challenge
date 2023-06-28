export default function ({ route, redirect }) {
    // Retrieve the token from localStorage
    const accessToken = localStorage.getItem('accessToken')

    // Check if the user is signed in
    const signedIn = !!accessToken;

    // Redirect to the login page if not signed in
    if (!signedIn && route.name !== 'login') {
        redirect('/login');
    }
}
