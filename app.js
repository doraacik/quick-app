const express = require('express');
const pool = require("./helper/postgres");
const bodyParser = require('body-parser'); //express could not handle it so I used body-parser.

const app = express();

app.use(bodyParser.json());

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));


const PORT = 4002;

// Error handling for database connection
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Connect to PostgreSQL database
async function connectToDatabase() {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release(); // Release the client back to the pool!!!
  } catch (error) {
    console.error('Error connecting to PostgreSQL database:', error);
    process.exit(-1);
  }
}
connectToDatabase();

/*
I used these commented lines to create table and insert data to the database cuz I didn't use pgadmin.
//SQL queries for table creation and data insertion
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    midterm_grade INT NOT NULL,
    final_grade INT NOT NULL
  )
`;

//SQL query to insert data
const insertDataQuery = `
  INSERT INTO students (name, midterm_grade, final_grade) VALUES 
  ('Dora', 80, 90),
  ('Dora2', 70, 90)
`;
// This function is to create student table.
async function createTables() {
  try {
    const client = await pool.connect();
    await client.query(createTableQuery);
    console.log('Table "students" created successfully');
    client.release();
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(-1);
  }
}

// this function is to insert data into table
async function insertData() {
  try {
    const client = await pool.connect();
    await client.query(createTableQuery);
    await client.query(insertDataQuery);
    console.log('Data inserted successfully');
    client.release();
  } catch (error) {
    console.error('Error inserting data:', error);
    process.exit(-1);
  }
}

// Calling the functions to create tables and insert data
createTables()
  .then(() => insertData())
  .then(() => {
    console.log('Tables created and data inserted successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(-1);
  });*/

  //From this part I used my codes from the task1 changed them slightly to make them compatible with postgresql.
app.get('/',(req,res) => { 
    // Send index.html file to the client 
    res.sendFile(__dirname + '/index.html') 
});


app.get('/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/students/:id", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM students WHERE id = $1", [req.params.id]);

    if (result.rows.length === 0) {
      // If no student found with the given ID
      res.status(404).json({
        status: "error",
        message: "Student not found",
      });
    } else {
      const student = result.rows[0]; // Retrieve the first student (assuming ID is unique)
      const averageGrade = (student.midterm_grade + student.final_grade) / 2;

      res.status(200).json({
        status: "success",
        data: {
          id: student.id,
          name: student.name,
          midterm_grade: student.midterm_grade,
          final_grade: student.final_grade,
          average_grade: averageGrade,
        },
      });
    }

    client.release();
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

app.post('/submit', async (req, res) => {
  try {
    console.log('POST parameters received are:', req.body);
    const { name, midterm_grade, final_grade } = req.body;
    const client = await pool.connect();
    const insertQuery = `INSERT INTO students (name, midterm_grade, final_grade) VALUES ($1, $2, $3)`;
    const values = [name, midterm_grade, final_grade];

    await client.query(insertQuery, values);

    console.log("Data inserted successfully.");
    client.release();
    res.redirect('/');
  } 
  catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
