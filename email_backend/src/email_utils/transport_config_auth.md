# Nodemailer transport config auth

There's a number of options for authenticating nodemailer to your email service of choice. For most, and gmail in particular (our choice so far), OAuth2 is preffered for security purposes.

The Nodemailer documentation gives two OAuth schemes, [here](https://nodemailer.com/smtp/oauth2). It is completely lacking on specifics of how to set these up from gmails end though (don't blame them, Google changes this stuff regularily), although it references a lot of terms that will send you on a wild goose chase googleing around for Google's own documentation. I'm going to save you some time.

## 2LO authentication (service accounts)

[Nodemailer docs](https://nodemailer.com/smtp/oauth2/#oauth-2lo)

... seemingly the easier of the two, but I've not gotten it working. Can't find a way to delegate control of a gmail account to a google cloud service account, unclear but this may be a feature that requires GSuite. Skip this one unless we've started paying for GSuite.

## 3-legged OAuth2 authentication

[Nodemailer docs](https://nodemailer.com/smtp/oauth2/#oauth-3lo)

A real headache to set up, but this is what we currently use. It has flaked out on us once, requiring all the keys to be cycled, which is why I'm documenting the process now.

To start with, the following keys are optional and not necessary under our current setup: `accessToken`, `expires`, and `accessUrl`. Additionally, `type` will always be `"OAuth2"` and `user` is just the gmail address we will be sending email via. That just leaves `clientId`, `clientSecret`, and `refreshToken`.

`clientId` and `clientSecret` come from the same source:

- go to console.cloud.google.com
- create a new project (note: I already made a project while logged in as the email-sending account, skip this step. Note the project does not belong to the same account as the other InfoBase google cloud resources, you need to log in as the email-sending account to see it)
- Use "Search products and services" to search for "Gmail API", enable it for the project (already done, if you're on the right project)
- Use "Search products and services" to go to "APIs & Services" (or, if you're in the exisitng project, pick it from the left-hand hamburger menu)
- Look for "OAuth Consent Screen" under "APIs & Services". There's a lot in here that's not important (for instance, we don't actually care about getting it "verified"), just fill out the minimal information and select "email" as a required scope. (Again, already done for the exisitng project)
- Now look for "Credentials" under "APIs & Services". Choose Create Credentials > OAuth Client ID. Set type as "Web Application" and add https://developers.google.com/oauthplayground under "Authorized redirect URLs". Hit create, and it will tell you the new client ID and secret. Record both (if you're cycling creds for our email backend, store them in LastPass as `EMAIL_BACKEND_CLIENT_ID` and `EMAIL_BACKEND_CLIENT_SECRET`).

`refreshToken` is where things get funky:

- go to https://developers.google.com/oauthplayground
- Click the gear on the top right ("OAuth 2.0 configuration"). At the bottom of this menu, input the client ID and secret from step 1
- On the left hand side, under "Step 1", type "https://mail.google.com" in to "Input your own scopes" then hit authorize. This will redirect you to an OAuth log in page. Well, it will probably be a big angry error page about this not being a validated OAuth page (but, as said, we don't care); there's an advanced options button somewhere that lets you ignore the warning and continue to the OAuth menu. Log in as the email account that you want to be sending emails through and complete the OAuth.
- You should be bumped back to the OAuth playground site now, with "Step 2: Exchange authorization code for tokens" expanded. Hit the exchange button and record the refresh token it supplies you (for our purposes, `EMAIL_BACKEND_REFRESH_TOKEN` on LastPass)

And that's it! You don't need the authorization token, and the access token will expire periodically. If you supply the refresh token to Nodemailer, then it will automatically request new access tokens as necessary. You can now configure Nodemailer to send emails on behalf of your Gmail account.

Refresh tokens **shouldn't** expire on you, see [the docs](https://developers.google.com/identity/protocols/oauth2#expiration). I do not think we met any of these conditions, but something definietly caused our set of ID/secret/refresh token to break on us out of nowhere after months of smooth sailing. Still, not too hard to get new ones (...especially if someone is nice enough to document the steps here and you don't have to spend ages trying to figure it out yourself).
