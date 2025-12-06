if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('/api/users/token/refresh/', {
            refresh: refreshToken,
        });
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        return api(originalRequest);
    } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
    }
}
return Promise.reject(error);
    }
);

export default api;
