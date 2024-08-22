# Google Cloud SDK Autoconnect

This script automates the Google Cloud CLI authentication process.

When you enter the command:
```shell
$ gcloud auth login
```

A webpage opens on your browser then the script:
- Selects the first Google account
- Connects you to the selected Google account
- Allows *Google Cloud SDK* to access your Google account
- Copies the verification code to your clipboard
- Closes the tab
