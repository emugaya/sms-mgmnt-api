[![Test Coverage](https://api.codeclimate.com/v1/badges/6bca706338afd939bc85/test_coverage)](https://codeclimate.com/github/emugaya/sms-mgmnt-api/test_coverage)

# SMS Management API
This API enables users(Contacts) to register with the application to send and recieve SMS messages. This API uses JWT tokens for authentication implemented by `passport`.

## Installation Instructions for macOS High Sierra
- Clone the repo onto your computer and change directory to cloned repository.
```
git clone https://github.com/emugaya/sms-mgmnt-api.git
``` 
- Rename `.env.example` to `.env`
- Create a postgres database and update `DB_NAME` in the `.env` file
- Set evironment variables `source .env`
- Run `npm install` to install all node packages
- Install `sequelize-cli` globally with the command `npm install sequelize-cli -g`
- Run the database migrations with `sequelize db:migrate` command

- Run `./run.sh` to start the application

## Documentation / Features
- The user registers with a unique `email` and `telephone number`, `first name`, `last name`, and `password`.
- Users / contacts are only allowed to send SMS messages to numbers belonging to registered users.
- A recipient sees a message the sender has deleted.
- A sender sees a message the reciepient has deleted.
- Message is deleted after both the sender and recipient have deleted it from.
- Senders and Recipients are able to see both sent and received messages.

| Type | API Endpoint | Description|
| --- | --- | --- |
| POST | `/users/register` | User Registration. It requires **firstName**, **lastName**, **email**, **telephoneNumber**, **password**,**role** and **confirmPassword** fields.<br/><br/> **Sample Request Payload**<br/><pre>{<br/>&nbsp;&nbsp;&nbsp;"firstName": "Jane",<br/>&nbsp;&nbsp;&nbsp;"lastName": "Doe",<br/>&nbsp;&nbsp;&nbsp;"email": "jane.doe@email.com",<br/>&nbsp;&nbsp;&nbsp;"telephoneNumber": "0987654321",<br/>&nbsp;&nbsp;&nbsp;"role": "USER",<br/>&nbsp;&nbsp;&nbsp;"password": "Test@2134",<br/>&nbsp;&nbsp;&nbsp;"confirmPassword": "Test@2134"<br/>}</pre>**Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;&nbsp;"message": "User account created succesfully"<br/>}</pre>|
| POST | `/users/login` | User Login. This enpoint requires a valid **email** and **password**.<br/><br/> **Sample Request Payload**<br/><pre>{<br/>&nbsp;&nbsp;&nbsp;"email": "jane.doe@email.com",<br/>&nbsp;&nbsp;&nbsp;"password": "Test@2134"<br/>}</pre>**Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;&nbsp;"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9<br/>.eyJwcm9maWxlIjp7ImlkIjo2OSwiZmlyc3ROYW1lIjoiZmlyc3ROYW1lIiwibGFzdE5hbWUiOiJsYXN0TmFtZSIsImVtYWlsIjoiZW1haWxAZW1haWwuY29tIn0sInRva2VuIjoxMDAzMjQzNDksImlhdCI6MTU1MjUxOTQyM30.<br/>SHporPtNHtYiauQvTR4o0iB1ZedtjiyEJEK8Xt_nV9A" <br/>}</pre>|
| PUT | `users/logout` | Logout User. Here a PUT request is sent with a valid token in the headers. The Authorization header is expected to be in the format below: <pre>JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9maWxlIjp7ImlkIjo2OSwiZmlyc3ROYW1lIjoiZmlyc3ROYW1lIiwibGFzdE5hbWUiOiJsYXN0TmFtZSIsImVtYWlsIjoiZW1haWxAZW1haWwuY29tIn0sInRva2VuIjoxMDAzMjQzNDksImlhdCI6MTU1MjUxOTQyM30.SHporPtNHtYiauQvTR4o0iB1ZedtjiyEJEK8Xt_nV9A`</pre><br/>**Sample Response**<br/><pre>{<br>&nbsp;&nbsp;&nbsp;"message": "You are now logged out"<br/>}</pre>|
| DELETE | `/users/:id` | Delete user by id. This deletes a user and all SMS messages associated with them.It's only admins that can delete a user or contact<br/><br/>**Sample Response**<br/>|
| POST | `/sms` | Send SMS message. This enpoint requires that you send the number your sending to **toNumber** and **message** in the payload.<br/><br/>**Sample Request Payload**<br/><pre>{<br/>&nbsp;&nbsp;&nbsp;"message": "Hello World",<br/>&nbsp;&nbsp;&nbsp;"toNumber": "0963053842"<br/>}</pre><br/>**Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;&nbsp;"id": 28,<br/>&nbsp;&nbsp;&nbsp;"message": "Hello World",<br/>&nbsp;&nbsp;&nbsp;"toNumber": "0963053842",<br/>&nbsp;&nbsp;&nbsp;"fromNumber": "0863053842"<br/>}<pre>|
| GET | `/sms/sent` | Gets all SMS messages sent by the user<br/><br/>**Sample Response**<br/><pre>[<br/>&nbsp;&nbsp;&nbsp;{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"id": 19,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"message": "Hello World",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"fromNumber": "0863053842",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"toNumber": '0963053842',<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"dateSent": "2019-03-14T12:20:32.551Z"<br/>&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"id": 30,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"message": "Hello World Sms",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"fromNumber": "0863053842",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"toNumber": '0963053842',<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"dateSent": "2019-03-14T12:35:57.441Z"<br/>&nbsp;&nbsp;&nbsp;}<br/>]|
| GET | `/sms/sent` | Gets all SMS messages received by the user<br/><br/>**Sample Response**<br/><pre>[<br/>&nbsp;&nbsp;&nbsp;{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"id": 19,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"message": "Hello World",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"fromNumber": "0863053842",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"toNumber": '0963053842',<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"dateRecieved": "2019-03-14T12:20:32.551Z"<br/>&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"id": 30,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"message": "Hello World Sms",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"fromNumber": "0863053842",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"toNumber": '0963053842',<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"dateRecieved": "2019-03-14T12:35:57.441Z"<br/>&nbsp;&nbsp;&nbsp;}<br/>]|
| GET | `/sms/:id` | Get single Sms Message. This needs a user to pass the sms id in the url parms.<br/><br/>**Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;&nbsp;"id": 45,<br/>&nbsp;&nbsp;&nbsp;"message": "Hello World Msg",<br/>&nbsp;&nbsp;&nbsp;"toNumber": "0963053842",<br/>&nbsp;&nbsp;&nbsp;"fromNumber": "0863053842",<br/>&nbsp;&nbsp;&nbsp;"dateSent": "2019-03-14T13:10:18.003Z"<br>}</pre>|
| DELETE | `/sms/:id` | Delete single Sms Message.<br/><br/>**Sample Response**<br/><pre>{<br/>&nbsp;&nbsp;&nbsp;"message": "Sms deleted succesfully"<br/>}</pre>|


## Testing
Upate the `.env` with your test database credentials and activate them on the console by running `source .env`. Run the command below there after.
```
npm test 
```