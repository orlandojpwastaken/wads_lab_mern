## API Testing Screenshots

### Adding a New Todo Item
![Add Todo Test](assets/addTest.png)

### Getting All Todo Items
![Get Todos Test](assets/getTest.png)

### Updating a Todo Item
![Update Todo Test](assets/updateTest.png)

### Deleting a Todo Item
![Delete Todo Test](assets/deleteTest.png)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your MongoDB connection string:
   ```
   CONNECTION_URL=your_mongodb_connection_string
   PORT=5000
   ```
4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /service/todo` - Create a new todo
- `GET /service/todo` - Get all todos
- `PUT /service/todo/:id` - Update a todo
- `DELETE /service/todo/:id` - Delete a todo 