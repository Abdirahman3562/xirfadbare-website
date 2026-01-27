import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key_change_me_later', {
    expiresIn: '30d',
  });
};

export default generateToken;





