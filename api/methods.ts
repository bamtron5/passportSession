import express = require('express');
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as jwt from 'jsonwebtoken';
import * as session from 'express-session';
import User from '../models/User';
let router = express.Router();
// let ensureLogin = require('connect-ensure-login').ensureLoggedIn;
