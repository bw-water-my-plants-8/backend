const yup = require('yup')

module.exports = yup.object().shape({
    username: yup.string()
        .required('username, password and telephone number are required')
        .min(3, 'username must be at least 3 characters'),
    password: yup.string()
        .required('username, password and telephone number are required'),
    phone: yup.string()
        .required('username, password and telephone number are required')
})
