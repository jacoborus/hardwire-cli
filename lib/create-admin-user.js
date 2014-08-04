/*
Create a new bulk admin user in DDBB:
email: admin@admin.com
password: admin
*/
'use strict';

var create = function () {
	var fs = require('fs'),
		path = require('path'),
		crypto = require('crypto'),
		configPath = path.resolve('./config/default.json'),
		// mongoose module path
		mPath = path.resolve( '.', 'node_modules/hardwire/node_modules/mongoose/index.js' ),
		config, mongoose;

	// load Mongoose
	if (fs.existsSync( mPath )) {
		mongoose = require( mPath );
	} else {
		console.log( 'You must install dependenciens before create admin user' );
		process.exit(1);
	}


	if (fs.existsSync( configPath )) {
		config = require( configPath );
	} else {
		console.log( 'Can\'t find config' );
		process.exit(1);
	}

	var Schema = mongoose.Schema;

	var makeSalt = function() {
		return Math.round(new Date().valueOf() * Math.random()) + '';
	};

	var encryptPassword = function(password, salt) {
		var encrypred, err;
		if (!password) {
			return '';
		}
		encrypred = void 0;
		try {
			encrypred = crypto.createHmac('sha1', salt).update(password).digest('hex');
			return encrypred;
		} catch (_error) {
			err = _error;
			return '';
		}
	};

	var creadmin = function() {

		/*
			User Schema
		 */
		var User, UserSchema, admin, sal;
		UserSchema = new Schema({
			email: String,
			since: Date,
			provider: String,
			hashed_password: String,
			password: String,
			_password: String,
			rol: String,
			salt: String,
			authToken: String,
			lastVisit: Date,
			activo: Boolean
		});
		User = mongoose.model('User', UserSchema);
		sal = makeSalt();
		admin = new User({
			email: 'admin@admin.com',
			since: new Date(),
			provider: 'local',
			hashed_password: encryptPassword('admin', sal),
			salt: sal,
			rol: 'admin',
			authToken: String,
			lastVisit: new Date(),
			activo: true
		});
		console.log(admin);
		return admin.save(function(err) {
			if (err) {
				console.log('error' + err);
				process.exit(0);
			}
			console.log('Usuario admin creado. Recuerde cambiar contraseña');
			return process.exit(0);
		});
	};

	if (mongoose.connection.readyState !== null) {
		mongoose.connect(config.mongodb.uri, function(err) {
			var msg;
			if (err) {
				msg = 'Failed to connect to mongodb instance at ' + config.mongodb.uri + '. Please confirm database instance is running.';
				return msg;
			} else {
				return creadmin();
			}
		});
	} else {
		console.log('no mongoose connection readyState');
	}
}

module.exports = create;