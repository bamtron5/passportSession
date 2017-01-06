import * as mongoose from 'mongoose';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

export interface IFacebook {
  token: string,
  name: string,
  email: string
}

export interface IUser extends mongoose.Document {
  username: { type: String, lowercase: true, unique: true},
  email: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  salt: String,
  facebookId: String,
  facebook: IFacebook,
  setPassword(password: string): boolean,
  validatePassword(password: string): boolean,
  generateJWT(): JsonWebKey,
  roles: Array<String>
}

let UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, unique: true},
  email: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  salt: String,
  facebookId: String,
  facebook: {
    token: String,
    name: String,
    email: String
  },
  roles: {type: Array, default: ['user']}
});

UserSchema.method('setPassword', function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
});

UserSchema.method('validatePassword', function(password) {
  let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  return (hash === this.passwordHash);
});

UserSchema.method('generateJWT', function() {
  return jwt.sign({
    id: this._id.toString(),
    _id: this._id,
    username: this.username,
    email: this.email
  }, process.env.JWT_SECRET, {expiresIn: '2 days'});
});

export const User = mongoose.model<IUser>("User", UserSchema);
