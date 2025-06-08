html_course_example = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Course - Skill Burner Inspired</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        /* General Body Styles */
        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #4B0082, #8A2BE2, #8B008B); /* Deep purple to magenta gradient */
            color: #E0E0E0; /* Light grey text */
            box-sizing: border-box; /* Include padding in element's total width and height */
        }

        /* Main Course Container - Mimics the 'Skill Burner' card */
        .course-container {
            background-color: rgba(255, 255, 255, 0.1); /* Slightly transparent white */
            backdrop-filter: blur(10px); /* Frosted glass effect */
            -webkit-backdrop-filter: blur(10px); /* Safari support */
            border-radius: 20px; /* Rounded corners */
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); /* Soft shadow */
            border: 1px solid rgba(255, 255, 255, 0.18); /* Subtle border */
            padding: 40px;
            max-width: 800px; /* Max width for content */
            width: 100%; /* Fluid width */
            text-align: center;
            /* Removed animation: fadeIn 1s ease-out; */
        }

        /* Removed Keyframe for fade-in animation */

        /* Headings */
        h1 {
            font-size: 2.8em;
            color: #FFFFFF; /* White for main title */
            margin-bottom: 10px;
            font-weight: 700;
        }

        h2 {
            font-size: 1.8em;
            color: #FFD700; /* Gold for section titles */
            margin-top: 30px;
            margin-bottom: 15px;
            font-weight: 600;
        }

        h3 {
            font-size: 1.4em;
            color: #ADD8E6; /* Light blue for module titles */
            margin-top: 25px;
            margin-bottom: 10px;
            font-weight: 600;
        }

        /* Paragraphs */
        p {
            font-size: 1.1em;
            line-height: 1.6;
            margin-bottom: 20px;
            color: #E0E0E0;
        }

        /* Course Description Section */
        .course-description {
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Modules/Lessons List */
        .modules-list {
            list-style: none; /* Remove default bullet points */
            padding: 0;
            text-align: left; /* Align text left within the list */
            margin: 0 auto;
            max-width: 600px; /* Constrain list width */
        }

        .module-item {
            background-color: rgba(255, 255, 255, 0.08); /* Slightly darker transparent background for items */
            border-radius: 10px;
            padding: 15px 20px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            /* Removed transition: transform 0.2s ease, background-color 0.2s ease; */
        }

        .module-item:hover {
            /* Removed hover effects */
            transform: none; /* Ensure no residual transform */
            background-color: rgba(255, 255, 255, 0.08); /* Revert to normal background on hover */
        }

        .module-item span {
            font-size: 1.2em;
            font-weight: 500;
            margin-right: 15px;
            color: #ADD8E6; /* Light blue for module numbers */
        }

        .module-item p {
            margin: 0; /* Remove default paragraph margin */
            flex-grow: 1; /* Allow paragraph to take available space */
            color: #F5F5F5;
        }

        /* Removed Call to Action Button styles */

        /* Responsive Design */
        @media (max-width: 768px) {
            .course-container {
                padding: 30px;
                margin: 10px; /* Adjust margin for smaller screens */
            }

            h1 {
                font-size: 2em;
            }

            h2 {
                font-size: 1.5em;
            }

            h3 {
                font-size: 1.2em;
            }

            p {
                font-size: 1em;
            }

            /* Removed cta-button specific responsive styles */

            .module-item {
                flex-direction: column; /* Stack module number and title on small screens */
                align-items: flex-start;
            }

            .module-item span {
                margin-bottom: 5px;
            }
        }

        @media (max-width: 480px) {
            body {
                padding: 10px;
            }
            .course-container {
                padding: 20px;
                border-radius: 15px;
            }
            h1 {
                font-size: 1.8em;
            }
        }

        /* Header specific styles */
        .course-header {
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .course-header h1 {
            margin-bottom: 5px;
        }
        .course-header p {
            font-size: 1.2em;
            color: #A0C0E0; /* Slightly different color for header tagline */
            margin-bottom: 0;
        }
    </style>
</head>
<body>
    <div class="course-container">
        <header class="course-header">
            <h1>Introduction to Web Development Essentials</h1>
            <p>Your journey to becoming a web developer starts here.</p>
        </header>

        <section class="course-description">
            <h2>Title</h2>
            <p>
                Welcome to "Web Development Essentials"! This course is designed for aspiring developers and anyone eager to build modern, responsive, and interactive websites from scratch. We'll cover fundamental concepts, best practices, and the core technologies that power the web.
            </p>
            <p>
                By the end of this course, you'll have a solid understanding of HTML, CSS, and basic JavaScript, equipping you with the skills to create your first web projects. Get ready to dive in and transform your ideas into stunning digital experiences!
            </p>
        </section>

        <section class="course-modules">
            <h2>Course Modules</h2>
            <ul class="modules-list">
                <li class="module-item">
                    <span>01</span>
                    <p>Introduction to HTML: Structuring Your Web Content</p>
                </li>
                <li class="module-item">
                    <span>02</span>
                    <p>Styling with CSS: Making Your Web Pages Beautiful</p>
                </li>
                <li class="module-item">
                    <span>03</span>
                    <p>CSS Layouts: Flexbox and Grid for Responsive Design</p>
                </li>
                <li class="module-item">
                    <span>04</span>
                    <p>Introduction to JavaScript: Adding Interactivity</p>
                </li>
                <li class="module-item">
                    <span>05</span>
                    <p>DOM Manipulation: Dynamic Web Content</p>
                </li>
                <li class="module-item">
                    <span>06</span>
                    <p>Basic Form Handling and Validation</p>
                </li>
                <li class="module-item">
                    <span>07</span>
                    <p>Bringing It All Together: Building Your First Project</p>
                </li>
            </ul>
        </section>
        <!-- Removed the "Start Learning Now!" button -->
    </div>
</body>
</html>

"""

