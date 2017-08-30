## Setup

1. Clone this repo
2. Create your [OAuth 2.0 credentials](https://developers.google.com/youtube/v3/guides/auth/client-side-web-apps) for the Youtube API. Make sure to specify `http://localhost:5000/oauth2callback` as your authorized redirect URIs.
3. Download the credentials.
4. Copy the `.env-template` on located on the root of this folder and rename it to `.env`.
5. Assign `VIDEO_LOCATION` the folder you'd like to be watched.
6. Assign `VIDEO_DESRCIPTION` the description of your video, defaults to the current date if it's not specified.
7. Assign `CREDENTIALS_LOCATION` the location of the credentials files downloaded on step 3.

## Running

Simply execute `npm start`

## Contributing

Any contributions it's well received! Fork this repository and submit your PRs.