html_course_example = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Course Title</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            margin: 0; padding: 20px;
            display: flex; justify-content: center; align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #4B0082, #8A2BE2, #8B008B);
            color: #E0E0E0;
        }
        .course-container {
            background-color: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
            padding: 40px; max-width: 800px; width: 100%;
            text-align: center;
        }
        h1 { font-size: 2.8em; color: #FFFFFF; margin-bottom: 10px; font-weight: 700; }
        h2 { font-size: 1.8em; color: #FFD700; margin-top: 30px; margin-bottom: 15px; font-weight: 600; }
        h3 { font-size: 1.4em; color: #ADD8E6; margin-top: 25px; margin-bottom: 10px; font-weight: 600; }
        p { font-size: 1.1em; line-height: 1.6; margin-bottom: 20px; color: #E0E0E0; }
        .course-header { margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        .modules-list { list-style: none; padding: 0; text-align: left; margin: 0 auto; max-width: 600px; }
        .module-item {
            background-color: rgba(255, 255, 255, 0.08);
            border-radius: 10px; padding: 15px 20px; margin-bottom: 15px;
            display: flex; align-items: center;
        }
        .module-item span { font-size: 1.2em; font-weight: 500; margin-right: 15px; color: #ADD8E6; }
        .module-item p { margin: 0; flex-grow: 1; color: #F5F5F5; }
    </style>
</head>
<body>
    <div class="course-container">
        <header class="course-header">
            <h1>Course Title Here</h1>
            <p>Course description tagline</p>
        </header>
        <section class="course-description">
            <h2>Overview</h2>
            <p>Course description and objectives...</p>
        </section>
        <section class="course-modules">
            <h2>Learning Steps</h2>
            <ul class="modules-list">
                <li class="module-item">
                    <span>01</span>
                    <p>Step 1: Description</p>
                </li>
                <li class="module-item">
                    <span>02</span>
                    <p>Step 2: Description</p>
                </li>
                <!-- Repeat for all steps -->
            </ul>
        </section>
    </div>
</body>
</html>
"""