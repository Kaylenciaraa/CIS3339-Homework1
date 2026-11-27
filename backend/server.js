
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({
    path: path.join(__dirname, '.env')
});

const Student = require('./models/Student');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

const app = express();
const apiRouter = express.Router();

app.use(cors());
app.use(express.json());

// Get all students
apiRouter.get('/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        console.error('Error retrieving students:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Search for a student by name
apiRouter.post('/find-student', async (req, res) => {
    try {
        const { name } = req.body;

        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                error: 'Student name is required'
            });
        }

        const student = await Student.findOne({
            name: name.trim()
        });

        if (!student) {
            return res.status(404).json({
                error: 'Student not found'
            });
        }

        res.status(200).json(student);

    } catch (error) {
        console.error('Error finding student:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Add a new student
apiRouter.post('/add-student', async (req, res) => {
    try {
        const { name, id, phone, zip } = req.body;

        if (![name, id, phone, zip].every(
            value => typeof value === 'string' && value.trim()
        )) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        const existingStudent = await Student.findOne({
            id: id.trim()
        });

        if (existingStudent) {
            return res.status(409).json({
                error: 'Student ID already exists'
            });
        }

        const newStudent = await Student.create({
            name,
            id,
            phone,
            zip
        });

        res.status(201).json({
            message: 'Student added successfully',
            student: newStudent
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                error: 'Student ID already exists'
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: error.message
            });
        }

        console.error('Error adding student:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Delete a student and their enrollments
apiRouter.post('/delete-student', async (req, res) => {
    try {
        const { name, id } = req.body;

        let student;

        if (typeof id === 'string' && id.trim()) {
            student = await Student.findOne({
                id: id.trim()
            });
        } else if (typeof name === 'string' && name.trim()) {
            student = await Student.findOne({
                name: name.trim()
            });
        } else {
            return res.status(400).json({
                error: 'Student ID or name is required'
            });
        }

        if (!student) {
            return res.status(404).json({
                error: 'Student not found'
            });
        }

        // Remove associated enrollments
        await Enrollment.deleteMany({
            student: student._id
        });

        // Remove the student
        await Student.deleteOne({
            _id: student._id
        });

        res.status(200).json({
            message: 'Student deleted successfully',
            student
        });

    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// ==============================
// COURSE MANAGEMENT
// ==============================

// Get all courses
apiRouter.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();

        res.status(200).json(courses);

    } catch (error) {
        console.error('Error retrieving courses:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Add a new course
apiRouter.post('/add-course', async (req, res) => {
    try {
        const { courseId, courseName } = req.body;

        if (![courseId, courseName].every(
            value => typeof value === 'string' && value.trim()
        )) {
            return res.status(400).json({
                error: 'Course ID and course name are required'
            });
        }

        const existingCourse = await Course.findOne({
            courseId: courseId.trim()
        });

        if (existingCourse) {
            return res.status(409).json({
                error: 'Course ID already exists'
            });
        }

        const newCourse = await Course.create({
            courseId,
            courseName
        });

        res.status(201).json({
            message: 'Course added successfully',
            course: newCourse
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                error: 'Course ID already exists'
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: error.message
            });
        }

        console.error('Error adding course:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Delete a course and its enrollments
apiRouter.delete('/courses/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findOne({
            courseId
        });

        if (!course) {
            return res.status(404).json({
                error: 'Course not found'
            });
        }

        // Remove associated enrollments
        await Enrollment.deleteMany({
            course: course._id
        });

        // Remove the course
        await Course.deleteOne({
            _id: course._id
        });

        res.status(200).json({
            message: 'Course deleted successfully',
            course
        });

    } catch (error) {
        console.error('Error deleting course:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// ==============================
// ENROLLMENT MANAGEMENT
// ==============================

// Get all enrollments
apiRouter.get('/enrollments', async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate('student')
            .populate('course');

        res.status(200).json(enrollments);

    } catch (error) {
        console.error('Error retrieving enrollments:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Enroll a student in a course
apiRouter.post('/add-enrollment', async (req, res) => {
    try {
        const { studentId, courseId } = req.body;

        if (![studentId, courseId].every(
            value => typeof value === 'string' && value.trim()
        )) {
            return res.status(400).json({
                error: 'Student ID and course ID are required'
            });
        }

        // Verify that the student exists
        const student = await Student.findOne({
            id: studentId.trim()
        });

        if (!student) {
            return res.status(404).json({
                error: 'Student not found'
            });
        }

        // Verify that the course exists
        const course = await Course.findOne({
            courseId: courseId.trim()
        });

        if (!course) {
            return res.status(404).json({
                error: 'Course not found'
            });
        }

        // Check for duplicate enrollment
        const existingEnrollment = await Enrollment.findOne({
            student: student._id,
            course: course._id
        });

        if (existingEnrollment) {
            return res.status(409).json({
                error: 'Student is already enrolled in this course'
            });
        }

        // Create the enrollment
        const newEnrollment = await Enrollment.create({
            student: student._id,
            course: course._id
        });

        res.status(201).json({
            message: 'Student enrolled successfully',
            enrollment: newEnrollment
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                error: 'Student is already enrolled in this course'
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: error.message
            });
        }

        console.error('Error creating enrollment:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get all students enrolled in a specific course
apiRouter.get('/courses/:courseId/students', async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findOne({
            courseId
        });

        if (!course) {
            return res.status(404).json({
                error: 'Course not found'
            });
        }

        const enrollments = await Enrollment.find({
            course: course._id
        }).populate('student');

        const students = enrollments
            .map(enrollment => enrollment.student)
            .filter(student => student !== null);

        res.status(200).json({
            course,
            students
        });

    } catch (error) {
        console.error('Error retrieving course roster:', error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// ==============================
// API AND PRODUCTION FRONTEND
// ==============================

// Register all API endpoints
app.use('/api', apiRouter);

// Return JSON for unknown API endpoints
app.use('/api', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found'
    });
});

// Locate the Vue production build
const frontendPath = path.join(
    __dirname,
    '../frontend/dist'
);

// Serve Vue production files
app.use(express.static(frontendPath));

// Support Vue Router page refreshes
app.get(
    ['/', '/students', '/courses', '/enrollments'],
    (req, res) => {
        res.sendFile(
            path.join(frontendPath, 'index.html')
        );
    }
);


// Connect to MongoDB and start the server
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Initialize collections and indexes
        await Promise.all([
            Student.init(),
            Course.init(),
            Enrollment.init()
        ]);

        console.log('Connected to MongoDB successfully');

        app.listen(PORT, () => {
            console.log(
                `Server is running on http://localhost:${PORT}`
            );
        });

    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

startServer();

