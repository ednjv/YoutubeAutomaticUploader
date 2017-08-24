require('dotenv').config();
const Youtube = require('youtube-api'),
  fs = require('fs'),
  readJson = require('r-json'),
  Lien = require('lien'),
  Logger = require('bug-killer'),
  opn = require('opn'),
  prettyBytes = require('pretty-bytes');
const chokidar = require('chokidar');
const videoLocation = process.env.VIDEO_LOCATION;
const videoDescription = process.env.VIDEO_DESRCIPTION || new Date();
// https://support.google.com/youtube/troubleshooter/2888402
const allowedExtensions = [
  'mov',
  'mpeg4',
  'mp4',
  'avi',
  'mpg',
  'wmv',
  'mpegps',
  'flv'
];
const path = require('path');
let isUploading = false;

if (!videoLocation) {
  console.log('Please specify a watch folder');
  process.exit();
}

const CREDENTIALS = readJson(`${__dirname}/credentials.json`);

const server = new Lien({
  host: 'localhost',
  port: 5000
});

const oauth = Youtube.authenticate({
  type: 'oauth',
  client_id: CREDENTIALS.web.client_id,
  client_secret: CREDENTIALS.web.client_secret,
  redirect_url: CREDENTIALS.web.redirect_uris[0]
});

opn(oauth.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/youtube.upload']
}));

setLoader = (request) => {
  setInterval(() => {
    if (isUploading) {
      Logger.log(`${prettyBytes(request.req.connection._bytesDispatched)} bytes uploaded.`);
    }
  }, 250);
};

uploadVideo = (videoPath, videoName) => {
  isUploading = true;
  const req = Youtube.videos.insert({
    resource: {
      snippet: {
        title: videoName,
        description: videoDescription
      },
      status: {
        privacyStatus: 'private'
      }
    },
    part: 'snippet,status',
    media: {
      body: fs.createReadStream(videoPath)
    }
  }, (err) => {
    if (err) console.log(err);
    console.log('Done.');
  });

  setLoader(req);
}

createDirectoryWatcher = () => {
  const joinedExtensions = allowedExtensions.join(',');
  const location = `${videoLocation}/**/*.{${joinedExtensions}}`;
  console.log(location);
  const watcher = chokidar.watch(location, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('add', (newVideo) => {
    const videoName = path.basename(newVideo);
    console.log('File', videoName, 'has been added');
    uploadVideo(newVideo, videoName);
  });
}

server.addPage('/oauth2callback', lien => {
  Logger.log(`Trying to get the token using the following code: ${lien.query.code}`);
  oauth.getToken(lien.query.code, (err, token) => {
    if (err) {
      lien.lien(err, 400);
      return Logger.log(err);
    }

    Logger.log('Got the token.');

    oauth.setCredentials(token);

    lien.end('You can start adding videos on your folder.');
    createDirectoryWatcher();
  });
});