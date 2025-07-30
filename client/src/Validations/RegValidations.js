import * as yup from 'yup';

export const RegValidations = yup.object().shape({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^[a-zA-Z0-9]*$/, 'Password must contain only letters and numbers')  // No symbols allowed
    .matches(/[a-zA-Z]/, 'Password must contain at least one letter')  // At least one letter
    .matches(/[0-9]/, 'Password must contain at least one number')  // At least one number
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});
