'use strict';

//-------- dependencies --------//

import fs from 'fs';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import babelify from 'babelify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import browserSync from 'browser-sync';
import del from 'del';
import ftp from 'vinyl-ftp';
import nodemailer from 'nodemailer';
import handlebars from 'gulp-compile-handlebars';
import merge from 'merge-stream';
import minimist from 'minimist';
import cmd from 'node-cmd';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
// const creds = JSON.parse(fs.readFileSync(".ftppass", "utf8"));


//-------- configure your project --------//

const config = {
   //project name taken from package.json
   project: pkg.name,

   // list any npm dependencies you want to exclude or override from package.json
   // The task scripts:libs will bundle them to 'src/shared/scripts/libs.js'
   depExcludes: [/* 'gsap' */],
   depOverrides: {
   },

   veeva: {
      // credentials to deploy to Veeva CRM by ftp
      domain: 'veeva.domain',
      username: "creds.veeva.username",
      password: "creds.veeva.password",

      //veeva will report upload errors to this address
      email: '',

      //find the product id for your presentation in salesforce:
      //  1.) go to the "product catalog" section
      //  2.) select the product link for your presentation
      //  3.) the id will be the 15 digit code in the browser url
      product: '',

      //veeva disable options for all key messages
      //place your custom options for this value
      disable_actions: ['Pinch_To_Exit_vod', 'Rotation Lock', 'Zoom', 'Swipe_vod'],

      // key_message_name: {
      //	  description: '',            //Required: key message description
      //	  disable_actions: [],        //Optional: override disable_actions for key message
      //   has_shared_resource: false, //Optional: don't link shared resource. default is true
      //	  is_shared_resource: true,   //Optional: identify shared resource key message. default is false
      //	}
      key_messages: {
         slide_ohg_base_example: {
            description: 'Example'
         },
      }
   },

   // set staging location for ftp (gulp ftp)
   staging: {
      domain: 'staging.domain',
      path: 'path/to/your/package' + pkg.name,
      username: "creds.staging.username",
      password: "creds.staging.password",
   },

   // addresses to send email with staging links (gulp notify)
   email: {
      username: "creds.gmail.username",
      password: "creds.gmail.password",
      from: '',
      to: ''
   }
}


//-------- internal --------//

const argv = minimist(process.argv.slice(2));
const key_messages = getKeyMessageNameArray();
const flagSlideName = checkFlags(
		   'slide',
		   argv.slide || argv.s,
		   key_messages,
		   '**' );


// returns value of flag after checking if its valid.
// If not valid, uses defaultValue and throws warning.
function checkFlags(flagName, flag, acceptedValues, defaultValue) {
   if (!flag) return defaultValue;
   for (var i=0; i < acceptedValues.length; ++i) {
      if (flag === acceptedValues[i]) {
         return flag;
      }
   }
   var msg = (flag === true) ? 'requires a value.' : 'with value: "'+flag+'" is invalid.';
   $.util.log($.util.colors.red('Warning: flag: "'+flagName+'" '+msg+' Flag will not be used.'));
   return defaultValue;
}

//return array of key message names with shared key message last
function getKeyMessageNameArray() {
   var array = [], message, name, shared;

   for (message in config.veeva.key_messages) {
      //name = message.toLowerCase().replace(/ /g, '-');
      if (config.veeva.key_messages[message].is_shared_resource === true) { shared = message; }
      else { array.push(message); }
   }
   if (shared) { array.push(shared); } //make shared key message last

   return array;
}

//returns a stream of a file named 'filename' with it's contents of 'string'
function srcFromString(filename, string) {
	var src = require('stream').Readable({ objectMode: true })
	src._read = function () {
		this.push(new $.util.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
		this.push(null)
	}
	return src;
}

//return array of paths from package.json dependencies
function getDependencyPaths(excludes, overrides) {
   var dependencies = pkg.dependencies;
   var paths = [];

   deploop: for (var dep in dependencies) {

      //check for excludes
      if (excludes && excludes.constructor === Array) {
         for (var i in excludes) {
            if (excludes[i] === dep) { //if exclude name matches dep name
               continue deploop; //skip to next iteration of deploop
            }
         }
      }

      //check for overrides
      if (overrides && overrides.constructor === Object) {
         for (var odep in overrides) {
            if (odep === dep) { //if override name matches dep name
               var overrideArray = overrides[odep];
               for (var overridePath in overrideArray) {
                  paths.push(overrideArray[overridePath]); //add overriden dependenies
               }
               continue deploop; //skip to next iteration of deploop
            }
         }
      }

      var dir = './node_modules/' + dep + '/';
      var filename = require('./' + dir + 'package.json').main;

      //slice off extra '/'
      filename =
         (filename.slice(0, 1) === '/') ? filename.slice(1) :
         (filename.slice(0, 2) === './') ? filename.slice(2) : filename;

      paths.push(dir + filename); //add dependencies
   }

   return paths;
}

var notifier = require('node-notifier');
// Standard handler
var standardHandler = function (err) {
  // Notification
  // var notifier = new notification();
  notifier.notify({ message: 'Error: ' + err.message });
  // Log to console
  $.util.log($.util.colors.red('Error'), err.message);
}

//-------- Workflow Tasks --------//


// inject npm dependencies
gulp.task('inject', () => {
   var streams = merge();
   var paths = getDependencyPaths( config.depExcludes, config.depOverrides );
   var sources = gulp.src(paths,{ read: false });
   console.log(paths);

   var stream1 = gulp.src(['src/**/*.html','src/**/*.hbs','src/**/*.scss'],{ base:'src' })
      .pipe($.inject(sources,{ relative:true }))
      .pipe(gulp.dest('src'));
});


gulp.task('lint', () => {
   var path = (flagSlideName === "**")
      ? ['src/**/*.js','!src/shared/scripts/libs.js']
      : 'src/'+ flagSlideName +'/**/*.js';

   return gulp.src('src/shared/scripts/es6/**/*.js')
      //.pipe(reload({ stream: true, once: true }))
      .pipe($.eslint())
      .pipe($.eslint.format())
      .pipe($.eslint.failAfterError());
});

gulp.task('styles', () => {
   var AUTOPREFIXER_BROWSERS = [
      'ie >= 10',
      'ie_mob >= 10',
      'ff >= 30',
      'chrome >= 34',
      'safari >= 7',
      'opera >= 23',
      'ios >= 7',
      'android >= 4.4',
      'bb >= 10'
   ];
   var path = (flagSlideName === "**") ? 'src/**/*.scss' : 'src/'+ flagSlideName +'/**/*.scss';

   return gulp.src(path,{ base:'src' })
      .pipe($.newer('.tmp'))
      .pipe($.plumber())
      .pipe($.sourcemaps.init())
      .pipe($.sass.sync({
         outputStyle: 'expanded',
         includePaths: ['src']
      }).on('error', $.sass.logError))
      .pipe($.autoprefixer({ browsers: AUTOPREFIXER_BROWSERS }))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('.tmp'))
      .pipe(reload({ stream: true }));
});


gulp.task('scripts', ['lint'], () => {
   var path = (flagSlideName === "**")
      ? ['src/**/*.js','!src/shared/scripts/libs.js']
      : 'src/'+ flagSlideName +'/**/*.js';

   browserify({
    entries: './src/shared/scripts/es6/main.js',
      debug: true
    })
    .transform(babelify)
    .on('error', standardHandler)
    .bundle()
    .on('error', standardHandler)
    .pipe(source('main.js'))
    .pipe(gulp.dest('./src/shared/scripts/'));

   return gulp.src(path,{ base:'src' })
      .pipe($.newer('.tmp'))
      .pipe($.plumber())
      .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('.tmp'))
      .pipe(reload({ stream: true }));
});


//convert handlebars files to html files.
//uses partials from 'src/shared/partials/'
//uses data from 'src/shared/scripts/handlebars.js'
gulp.task('html', () => {
   var hbs = require('./src/shared/scripts/handlebars.js');
   var hbsData = { data:hbs.data, config:config };
   var options = {
      ignorePartials: true, //ignores partials unknown to particular template
      partials: hbs.partials,
      batch: ['./src/shared/partials'],
      helpers: hbs.helpers
   };
   var path = (flagSlideName === "**")
      ? ['src/**/*.hbs','!src/shared/partials/**']
      : 'src/'+ flagSlideName +'/**/*.hbs';

   return gulp.src(path, { base:'src' })
      .pipe($.newer('.tmp'))
      .pipe(handlebars(hbsData, options))
      .pipe($.rename({ extname: '.html' }))
      .pipe(gulp.dest('.tmp'))
      .pipe(reload({ stream: true }));
});


//create index.html with links to all slides
gulp.task('index', () => {
   var streams = merge();
   var hbsData = { pathArray:[] };
   var hbsOptions = {}; //see https://www.npmjs.com/package/gulp-compile-handlebars
   var stream2;
   var stream1 = gulp.src('.tmp/**/*.html')
      .pipe($.tap( (file, t) => {
         var pos = file.path.search('/.tmp/');
         var path = file.path.slice(pos+6);
         hbsData.pathArray.push(path);
      }))
      .on('end', () => {
         stream2 = gulp.src('templates/index.hbs',{ base:'templates' })
            .pipe($.plumber())
            .pipe(handlebars(hbsData, hbsOptions))
            .pipe($.rename('index.html'))
            .pipe(gulp.dest('.tmp'));
         streams.add(stream2);
      });
   streams.add(stream1);

   return streams;
});


gulp.task('serve', ['html', 'styles', 'scripts', 'index'], () => {
   browserSync({
      notify: false,
      port: 9000,
      server: {
         baseDir: ['.tmp', 'src'],
         routes: {
            '/node_modules': 'node_modules'
         }
      }
   });

   gulp.watch('src/**/*.scss', ['styles']);
   gulp.watch('src/**/*.js', ['scripts']);
   gulp.watch('src/**/*.hbs', ['html']);
   gulp.watch('src/**/*.{jpg,jpeg,png,gif,svg}', reload);
});


//-------- Distribution Tasks --------//


gulp.task('clean:dist', () => {
   var path = (flagSlideName === "**") ? 'dist' : 'dist/'+ flagSlideName;
   return del(['dist']);
});


gulp.task('clean:tmp', () => {
   var path = (flagSlideName === "**") ? '.tmp' : '.tmp/'+ flagSlideName;
   return del(['.tmp']);
});

gulp.task('clean', (cb) => {
   $.sequence('clean:dist', 'clean:tmp', cb);
});


gulp.task('build:images', () => {
   var path = (flagSlideName === "**")
      ? 'src/**/*.{jpg,jpeg,png,gif,svg}'
      : 'src/'+ flagSlideName +'/**/*.{jpg,jpeg,png,gif,svg}';

   return gulp.src(path,{ base:'src' })
      .pipe($.cache($.imagemin({
         progressive: true,
         interlaced: true,
         svgoPlugins: [{ cleanupIDs: false }] // don't remove IDs
      })))
      .pipe(gulp.dest('dist'));
});


gulp.task('build:html', ['styles', 'scripts', 'html'], (cb) => {
   var count = 0;

   for (var i=0; i < key_messages.length; ++i) {
      if (flagSlideName === key_messages[i] || flagSlideName === '**') {

         var stream1 = gulp.src('.tmp/'+ key_messages[i] +'/*.html') //can't use base with useref
            .pipe($.plumber())
            .pipe($.newer('dist'))
            .pipe($.useref())
            .pipe($.if('*.js', $.uglify()))
            .pipe($.if('*.css', $.cssnano()))
            .pipe($.if('*.html', $.htmlmin({
               removeComments: true,
               collapseWhitespace: true,
               collapseBooleanAttributes: true,
               removeAttributeQuotes: true,
               removeRedundantAttributes: true,
               removeEmptyAttributes: true
            })))
            .pipe(gulp.dest('dist/'+ key_messages[i]))
            .on('end', () => {
               count++;
               if (count === key_messages.length-1) { return cb(); }
            });

         if (flagSlideName !== '**') { break; }
      }
   }
});


gulp.task('build:extras', () => {
   var folder = (flagSlideName === "**") ? flagSlideName +'/' : '';
   var path = [
      'src/'+ folder +'**',
      '!src/'+ folder +'**/*.hbs',
      '!src/'+ folder +'**/*.{jpg,jpeg,png,gif,svg}',
      '!src/'+ folder +'**/*.scss',
      '!src/'+ folder +'**/*.js',
      '!src/'+ folder +'templates/**',
      '!src/'+ folder +'templates/',
      '!src/'+ folder +'**/*.map'
   ]

   return gulp.src(path)
      .pipe($.newer('dist'))
      .pipe(gulp.dest('dist'));
});


// build ctl files. They are uploaded in conjunction with slide zips using ftp:veeva task
gulp.task('build:ctl', () => {
	var streams = merge();

	//start ctl file contents
	var globalCtl =
	"USER="+config.veeva.username+"\n"+
	"PASSWORD="+config.veeva.password+"\n";
	if (config.veeva.email) { globalCtl+= "EMAIL="+config.veeva.email+"\n"; } //email optional
	globalCtl +=
	"Product_vod__c="+config.veeva.product+"\n"+
	"CLM_ID_vod__c=VeevaCLM"+"\n"+
	"Active_vod__c=true"+"\n";

	//disable actions
	var globalDa;
	if (config.veeva.disable_actions) {
		if ( Array.isArray(config.veeva.disable_actions) ) {
			if ( config.veeva.disable_actions.length > 0) {
				globalDa = config.veeva.disable_actions;
			}
		}
		else { console.error("Error: gulpfile.babel.js: config.veeva.disable_actions: Must be an array"); }
	}

	for (var message in config.veeva.key_messages) {
		if (flagSlideName === message || flagSlideName === '**') {
			var ctl = globalCtl;
			var da = globalDa;

			//add to ctl file contents
			ctl +=
			"FILENAME="+message+".zip"+"\n"+
			"Name="+message+"\n";

			var desc = (config.veeva.key_messages[message].description) ? config.veeva.key_messages[message].description : message;
			ctl += "Description_vod__c="+desc+"\n";

			if (config.veeva.key_messages[message].is_shared_resource === true) {
				ctl += "is_shared_resource_vod__c=true"+"\n";
			}
			else {
				var shared = (config.veeva.key_messages[message].has_shared_resource === false) ? false : true;
				if (shared === true) {
					ctl += "shared_resource_vod__c="+key_messages[key_messages.length-1]+"\n";
				}
			}

			//override disable actions for specific slide
			if (config.veeva.key_messages[message].disable_actions) {
				if ( Array.isArray(config.veeva.key_messages[message].disable_actions) ) {
					da = config.veeva.key_messages[message].disable_actions;
				}
				else { console.error("Error: gulpfile.babel.js: config.veeva."+message+".disable_actions: Must be an array"); }
			}
			if (da) {
				ctl += "Disable_Actions_vod__c="+da.join(';')+"\n";
			}

			//write to file
			var stream = srcFromString(message+'.ctl', ctl)
		  		.pipe(gulp.dest('dist/ctl/'));
		  	streams.add(stream);

		  	if (flagSlideName !== '**') { break; }
		}
	}

	return streams;
});


//zip build folders
// gulp.task('zip', () => {
//    var streams = merge();
//    var message;

//    for (message in config.veeva.key_messages) {
//       var stream = gulp.src( 'dist/' + message + '/**')
//          .pipe($.zip( message + '.zip' ))
//          .pipe(gulp.dest('dist'))
//          .pipe($.size({title: message + '.zip:'}))
//       streams.add(stream);
//    }

//    for (message in config.veeva.shared_resource) {
//       var stream2 = gulp.src('**/*',{ cwd: __dirname + '/dist/shared' }) //contents without shared dir
//          .pipe($.zip( message + '.zip' ))
//          .pipe(gulp.dest('dist'))
//          .pipe($.size({title: message + '.zip:'}))
//       streams.add(stream2);
//    }

//    return streams;
// });


//zip dist folders
//Veeva had compression issue with Gulp-zip. Using command line resolves compression issue.
gulp.task('zip:cmd', (cb) => {
   var count = 0;
   var total = key_messages.length;
   var sharedMessage = key_messages[total-1];

   for (var i=0; i < total-1; ++i) {
      if (flagSlideName === key_messages[i] || flagSlideName === '**') {
         cmd.get('cd dist/ && zip -r '+ key_messages[i] +'.zip'+' '+ key_messages[i], (data) => {
            count++;
            if (flagSlideName === '**' && count === total ||
                flagSlideName !== '**') {
               return cb();
            }
         });
      }
   }

   if (flagSlideName === sharedMessage || flagSlideName === '**') {
      //contents without shared dir
      cmd.get('cd dist/shared && zip -r ../'+ sharedMessage +'.zip *', (data) => {
         count++;
         if (flagSlideName === '**' && count === total ||
             flagSlideName !== '**') {
            return cb();
         }
      });
   }
});


gulp.task('zip:size', () => {
   var streams = merge();

   for (var i in key_messages) {
      if (flagSlideName === key_messages[i] || flagSlideName === '**') {
         var stream = gulp.src('dist/'+ key_messages[i] +'.zip')
            .pipe($.size({title: key_messages[i] + '.zip:'}));
         streams.add(stream);
      }
   }

   return streams;
});


gulp.task('zip', (cb) => {
   $.sequence('zip:cmd', 'zip:size', cb);
});


gulp.task('build', function (cb) {
  $.sequence('build:ctl', 'build:html', 'build:styles', 'build:scripts', 'build:images', 'build:extras', 'zip', cb);
})


gulp.task('default', () => {
   gulp.start('build');
});


//-------- Utility Tasks --------//


//use this once after the config.key_messages object is completed.
//Will generate folder structure in src directory providing starting point for project
//For safety reasons, if slide folder already exists, than the folder will not be overidden
gulp.task('boilerplate', () => {
   var streams = merge();

   //create slide folders
   for (var i=0; i < key_messages.length-1; ++i) {
   	var name = key_messages[i];

   	//check if slide folder already exits
		try {
		   var stats = fs.lstatSync('src/'+ name);
		   if (stats.isDirectory()) {
		   	$.util.log($.util.colors.red('Warning: '+ name +' slide folder already exists and won\'t be overidden.'));
		   	continue;
		   }
		} catch (e) {}

   	if (flagSlideName === name || flagSlideName === '**') {
	      var hbsData = { slideId:name, config:config };
	      var hbsOptions = {}; //see https://www.npmjs.com/package/gulp-compile-handlebars
	      var stream1 = gulp.src('./templates/slide/**/*',{ base:'./templates/slide/' })
	         .pipe($.plumber())
	         .pipe(handlebars(hbsData, hbsOptions))
	            .on('error', err => {
	               if (err.message.substr(0,7) === 'Lexical') { return; } //ignore Lexical errors
	               else { console.log( 'Handlebars: Error: '+ err.message ) }
	            })
	         .pipe($.if('**/slide.hbs', $.rename(name + '.hbs'))) // rename
	         .pipe($.if('**/thumb.jpg', $.rename(name + '-thumb.jpg'))) // rename
	         .pipe($.if('**/scripts.hbs', $.rename('assets/scripts/slide.js'))) // rename
	         .pipe($.if('**/styles.hbs', $.rename('assets/styles/slide.scss'))) // rename
	         .pipe(gulp.dest( 'src/' + name ));
	      streams.add(stream1);

	      if (flagSlideName !== '**') { break; }
	   }
   }

   return streams;
});


//ftp files to staging server
gulp.task('ftp:staging', () => {

   var conn = ftp.create({
      host: config.staging.domain,
      user: config.staging.username,
      password: config.staging.password,
      parallel: 1000, //better results when set higher than server's max
      log: function(title, desc) {
         if (title === 'UP   ') {
            console.log(title, desc);
         }
      }
   });

   return gulp.src('dist/**','!dist/*.zip', { buffer: 'false' })
      .pipe(conn.dest(config.staging.path));
});


//ftp zip files to veeva sandbox
gulp.task('ftp:veeva', (cb) => {

   var conn = ftp.create({
      host: config.veeva.domain,
      user: config.veeva.username,
      password: config.veeva.password,
      parallel:1000, //better results when set higher than server's max
      log: function(title, desc) {
         if (title === 'UP   ') {
            console.log(title, desc);
         }
      }
   });

   var zips = [];
   var ctls = [];
   for (var i=0; i < key_messages.length; ++i) {
      if (flagSlideName === key_messages[i] || flagSlideName === '**') {

         zips.push('build/'+ key_messages[i] +'.zip');
         ctls.push('build/ctl/'+ key_messages[i] +'.ctl');

         if (flagSlideName !== '**') { break; }
      }
   }

   gulp.src( zips, { buffer:'false' })
   .pipe(conn.dest( '/'))
   .on('end', () => {
      gulp.src( ctls, { buffer:'false' })
         .pipe(conn.dest( '/ctlfile/'))
      .on('end', () => {
         return cb();
      })
   })
});


//email Project manager staging links
gulp.task('notify', (cb) => {
	//get email template
	var source = String(fs.readFileSync("templates/notify.hbs", "utf8"));
	var template = hbs.Handlebars.compile(source);
	var hbsData = { config:config };
	var html = template( hbsData );

   // setup e-mail data
   var options = {
      from: config.email.from,
      to: config.email.to,
      subject: config.project + ': Veeva Notification',
      html: html
   };

   // send mail with defined transport object
   var transporter = nodemailer.createTransport('smtps://' + config.email.username + '%40gmail.com:' + config.email.password + '@smtp.gmail.com');
   transporter.sendMail(options, function(error, info) {
      if (error) { return console.log(error); }

      console.log('Sent: ' + info.accepted);
      return cb();
   });
})


//-------- Uncomment Tasks below as an alternative to the task 'build:html' --------//


// gulp.task('html', ['styles', 'scripts'], () => {
//    return gulp.src('app/**/*.html')
//       .pipe($.useref({ searchPath: ['.tmp', 'app', '.'] }))
//       .pipe($.if('*.js', $.uglify()))
//       .pipe($.if('*.css', $.cssnano()))
//       .pipe($.if('*.html', $.htmlmin({ collapseWhitespace: true })))
//       .pipe(gulp.dest('dist'));
// });

//create shared/scripts/libs.js from npm dependecies
// gulp.task('scripts:libs', () => {
//    //returns array of dependency paths
//    var paths = getDependencyPaths( config.depExcludes, config.depOverrides );
//    console.log(paths);

//    return gulp.src(paths)
//       .pipe($.newer('src/shared/scripts/libs.js'))
//       .pipe($.plumber())
//       .pipe($.sourcemaps.init())
//       .pipe($.concat('libs.js'))
//       .pipe($.uglify())
//       .pipe($.sourcemaps.write('.'))
//       .pipe(gulp.dest('./src/shared/scripts'));
// });


gulp.task('build:scripts', ['scripts'], () => {
   var streams = merge();
   var path = (flagSlideName === "**") ? '.tmp/**/*.js' : '.tmp/'+ flagSlideName +'/**/*.js';

   var stream1 = gulp.src(path, { base:'.tmp' })
      .pipe($.newer('dist'))
      .pipe($.uglify()) // minify js
      .pipe(gulp.dest('dist'));
   streams.add(stream1);

   var stream2 = gulp.src('src/shared/scripts/libs.js', { base:'src' })
      .pipe($.newer('dist'))
      .pipe(gulp.dest('dist'));
   streams.add(stream2);

   return streams;
});


gulp.task('build:styles', ['styles'], () => {
   var path = (flagSlideName === "**") ? '.tmp/**/*.css' : '.tmp/'+ flagSlideName +'/**/*.css';

   return gulp.src(path,{ base:'.tmp' })
      .pipe($.newer('dist'))
      .pipe($.cssnano()) // minify css
      .pipe(gulp.dest('dist'));
});

gulp.task('build:html', ['html'], () => {
   var path = (flagSlideName === "**")
      ? ['.tmp/**/*.html','!.tmp/index.html']
      : '.tmp/'+ flagSlideName +'/**/*.html';

   return gulp.src(path,{ base:'.tmp' })
      .pipe($.newer('dist'))
      .pipe($.htmlmin({
         removeComments: true,
         collapseWhitespace: true,
         collapseBooleanAttributes: true,
         removeAttributeQuotes: true,
         removeRedundantAttributes: true,
         removeEmptyAttributes: true
      }))
      .pipe(gulp.dest('dist'));
});
