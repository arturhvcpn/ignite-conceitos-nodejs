const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(400).json({ error: 'User not found'});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);
  
  if(userAlreadyExists){
    return response.status(400).json({error: 'User already exists'});
  }
  
  const user = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  }

  users.push(user);

  // const userCreated = users.filter(user => user.username === username);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // const { username } = request.headers;
  const { user } = request;

  // const { todos } = users.find(user => user.username === username);

  // return response.status(200).json(todos);
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  // const { username } = request.headers;
  const { title, deadline } = request.body;

  // const user = users.find(user => user.username === username);

  const todo = {
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  // const { username } = request.headers;
  const { title, deadline } = request.body;
  const { id } = request.params;

  // const { todos } = users.find(user => user.username === username);
  
  const task = user.todos.find(todo => todo.id === id);

  if(!task) {
    return response.status(404).json({error: 'Task not found'});
  }

  task.title = title;
  task.deadline = new Date(deadline);

  return response.json(task);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // const { username } = request.headers;
  const { user } = request;
  const { id } = request.params;

  // const { todos } = users.find(user => user.username === username);

  const task = user.todos.find(todo => todo.id === id);

  if(!task) {
    return response.status(404).json({error: 'Task not found'});
  }

  task.done = true;

  return response.json(task);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // const { username } = request.headers;
  const { user } = request;
  const { id } = request.params;

  // const { todos } = users.find(user => user.username === username);

  const task = user.todos.findIndex(todo => todo.id === id);
  
  if(task === -1) {
    return response.status(404).json({error: 'Task not found'});
  }

  user.todos.splice(task, 1);

  return response.status(204).json();
});

module.exports = app;