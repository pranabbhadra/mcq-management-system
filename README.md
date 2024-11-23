# mcq-management-system

### Technologies Used
- Backend: Node.js, Express.js
- Frontend: EJS, Bootstrap
- Database: MongoDB (Mongoose ODM)
- Session Management: Express-session
- Validation & Security: bcrypt for password hashing
- Version Control: Git, GitHub


### Installation
Install the dependencies and devDependencies  where package.json folder lives and running the command -
```sh
$ npm install
```
<ol>
  <li>Create a Mongodb Database with name: # mcq-management-system</li>
<li> Add your environment variables.<br>
To do that create a file with name .env and add the appropriate values that matches with your development environment.<br>
A .env file may look something like:</li>
</ol>
<pre><code>
MONGO_URI=mongodb://localhost:27017/mcq-management-system
PORT=3000
</code></pre>

Then run the command
```sh
$ npm start
or
$ nodemon app.js
```

### Run the project
 - http://localhost:3000
