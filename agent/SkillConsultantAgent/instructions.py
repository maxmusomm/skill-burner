html_roadmap_example = """
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Cooking Learning Roadmap</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.5in;
        }

        .header {
            text-align: center;
            margin-bottom: 2rem;
            border-bottom: 3px solid #d4851c;
            padding-bottom: 1rem;
        }

        .header h1 {
            font-size: 2.5rem;
            color: #d4851c;
            margin-bottom: 0.5rem;
        }

        .header p {
            font-size: 1.1rem;
            color: #666;
            font-style: italic;
        }

        .phase {
            margin-bottom: 2rem;
            break-inside: avoid;
        }

        .phase-header {
            background: linear-gradient(135deg, #d4851c, #f4a460);
            color: white;
            padding: 0.8rem 1.2rem;
            border-radius: 8px 8px 0 0;
            margin-bottom: 0;
        }

        .phase-title {
            font-size: 1.4rem;
            font-weight: bold;
            margin-bottom: 0.3rem;
        }

        .phase-duration {
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .phase-content {
            background: #fafafa;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 8px 8px;
            padding: 1.2rem;
        }

        .skills-section {
            margin-bottom: 1.5rem;
        }

        .skills-title {
            font-size: 1.1rem;
            font-weight: bold;
            color: #d4851c;
            margin-bottom: 0.8rem;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 0.3rem;
        }

        .skill-item {
            margin-bottom: 0.8rem;
            padding-left: 1rem;
            position: relative;
        }

        .skill-item:before {
            content: "•";
            color: #d4851c;
            font-weight: bold;
            position: absolute;
            left: 0;
        }

        .skill-name {
            font-weight: bold;
            color: #333;
        }

        .skill-description {
            color: #666;
            margin-top: 0.2rem;
        }

        .recipes-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.8rem;
            margin-top: 0.8rem;
        }

        .recipe-item {
            padding: 0.6rem;
            font-size: 0.9rem;
        }

        .tips-section {
            background: #fff8dc;
            border-left: 4px solid #d4851c;
            padding: 1rem;
            margin-top: 1rem;
        }

        .tips-title {
            font-weight: bold;
            color: #d4851c;
            margin-bottom: 0.5rem;
        }

        .tip-item {
            margin-bottom: 0.3rem;
            font-size: 0.9rem;
        }

        .footer {
            margin-top: 2rem;
            text-align: center;
            padding-top: 1rem;
            border-top: 2px solid #d4851c;
            color: #666;
            font-size: 0.9rem;
        }

        @media print {
            body {
                max-width: none;
                padding: 0.3in;
            }

            .phase {
                page-break-inside: avoid;
            }
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Complete Cooking Learning Roadmap</h1>
        <p>From Kitchen Novice to Confident Home Chef</p>
    </div>

    <div class="phase">
        <div class="phase-header">
            <div class="phase-title">Phase 1: Kitchen Foundations</div>
            <div class="phase-duration">Duration: 2-3 weeks</div>
        </div>
        <div class="phase-content">
            <div class="skills-section">
                <div class="skills-title">Essential Skills</div>
                <div class="skill-item">
                    <div class="skill-name">Kitchen Safety & Hygiene</div>
                    <div class="skill-description">Hand washing, food storage, avoiding cross-contamination</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Basic Knife Skills</div>
                    <div class="skill-description">Holding a knife properly, basic cuts (dice, chop, slice)</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Kitchen Equipment Basics</div>
                    <div class="skill-description">Understanding pots, pans, and essential tools</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Reading Recipes</div>
                    <div class="skill-description">Understanding measurements, timing, and recipe structure</div>
                </div>
            </div>

            <div class="skills-section">
                <div class="skills-title">Practice Recipes</div>
                <div class="recipes-grid">
                    <div class="recipe-item">Toast with toppings</div>
                    <div class="recipe-item">Scrambled eggs</div>
                    <div class="recipe-item">Basic salad</div>
                    <div class="recipe-item">Boiled pasta</div>
                </div>
            </div>

            <div class="tips-section">
                <div class="tips-title">Pro Tips</div>
                <div class="tip-item">• Start with simple, one-pot meals</div>
                <div class="tip-item">• Keep a cooking journal to track what works</div>
                <div class="tip-item">• Watch your hands and knife at all times</div>
            </div>
        </div>
    </div>

    <div class="phase">
        <div class="phase-header">
            <div class="phase-title">Phase 2: Basic Cooking Methods</div>
            <div class="phase-duration">Duration: 3-4 weeks</div>
        </div>
        <div class="phase-content">
            <div class="skills-section">
                <div class="skills-title">Essential Skills</div>
                <div class="skill-item">
                    <div class="skill-name">Sautéing & Pan-frying</div>
                    <div class="skill-description">Heat control, oil temperature, when to flip</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Boiling & Steaming</div>
                    <div class="skill-description">Proper water ratios, timing, testing doneness</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Basic Seasoning</div>
                    <div class="skill-description">Salt, pepper, herbs, and taste adjustment</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Simple Sauces</div>
                    <div class="skill-description">Pan sauces, basic vinaigrettes, butter sauces</div>
                </div>
            </div>

            <div class="skills-section">
                <div class="skills-title">Practice Recipes</div>
                <div class="recipes-grid">
                    <div class="recipe-item">Stir-fried vegetables</div>
                    <div class="recipe-item">Pan-seared chicken breast</div>
                    <div class="recipe-item">Steamed rice</div>
                    <div class="recipe-item">Basic tomato sauce</div>
                    <div class="recipe-item">Sautéed mushrooms</div>
                    <div class="recipe-item">Simple soup</div>
                </div>
            </div>

            <div class="tips-section">
                <div class="tips-title">Pro Tips</div>
                <div class="tip-item">• Taste as you go and adjust seasoning</div>
                <div class="tip-item">• Let proteins rest before cutting</div>
                <div class="tip-item">• Medium heat is your friend for most cooking</div>
            </div>
        </div>
    </div>

    <div class="phase">
        <div class="phase-header">
            <div class="phase-title">Phase 3: Intermediate Techniques</div>
            <div class="phase-duration">Duration: 4-6 weeks</div>
        </div>
        <div class="phase-content">
            <div class="skills-section">
                <div class="skills-title">Essential Skills</div>
                <div class="skill-item">
                    <div class="skill-name">Roasting & Baking</div>
                    <div class="skill-description">Oven temperatures, timing, checking doneness</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Braising & Slow Cooking</div>
                    <div class="skill-description">Low and slow techniques, building flavors</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Advanced Knife Work</div>
                    <div class="skill-description">Julienne, brunoise, proper vegetable prep</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Flavor Building</div>
                    <div class="skill-description">Layering flavors, aromatics, spice combinations</div>
                </div>
            </div>

            <div class="skills-section">
                <div class="skills-title">Practice Recipes</div>
                <div class="recipes-grid">
                    <div class="recipe-item">Roasted chicken with vegetables</div>
                    <div class="recipe-item">Beef stew</div>
                    <div class="recipe-item">Homemade bread</div>
                    <div class="recipe-item">Risotto</div>
                    <div class="recipe-item">Fish with herb crust</div>
                    <div class="recipe-item">Curry from scratch</div>
                </div>
            </div>

            <div class="tips-section">
                <div class="tips-title">Pro Tips</div>
                <div class="tip-item">• Use a meat thermometer for perfect doneness</div>
                <div class="tip-item">• Build flavor bases with onions, carrots, celery</div>
                <div class="tip-item">• Learn to balance sweet, salty, sour, and umami</div>
            </div>
        </div>
    </div>

    <div class="phase">
        <div class="phase-header">
            <div class="phase-title">Phase 4: Advanced Cooking & Specialization</div>
            <div class="phase-duration">Duration: 8-12 weeks</div>
        </div>
        <div class="phase-content">
            <div class="skills-section">
                <div class="skills-title">Essential Skills</div>
                <div class="skill-item">
                    <div class="skill-name">Advanced Sauces</div>
                    <div class="skill-description">Emulsions, reductions, mother sauces</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Pastry & Baking Fundamentals</div>
                    <div class="skill-description">Doughs, batters, yeast, temperature control</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">International Cuisines</div>
                    <div class="skill-description">Exploring different cooking traditions and techniques</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Menu Planning & Prep</div>
                    <div class="skill-description">Mise en place, batch cooking, meal planning</div>
                </div>
            </div>

            <div class="skills-section">
                <div class="skills-title">Practice Recipes</div>
                <div class="recipes-grid">
                    <div class="recipe-item">Hollandaise sauce</div>
                    <div class="recipe-item">Fresh pasta from scratch</div>
                    <div class="recipe-item">Coq au vin</div>
                    <div class="recipe-item">Sourdough bread</div>
                    <div class="recipe-item">Thai curry paste</div>
                    <div class="recipe-item">Homemade ice cream</div>
                </div>
            </div>

            <div class="tips-section">
                <div class="tips-title">Pro Tips</div>
                <div class="tip-item">• Master timing by working backwards from serving time</div>
                <div class="tip-item">• Keep detailed notes on modifications and results</div>
                <div class="tip-item">• Practice plating and presentation techniques</div>
            </div>
        </div>
    </div>

    <div class="phase">
        <div class="phase-header">
            <div class="phase-title">Phase 5: Mastery & Creativity</div>
            <div class="phase-duration">Duration: Ongoing</div>
        </div>
        <div class="phase-content">
            <div class="skills-section">
                <div class="skills-title">Essential Skills</div>
                <div class="skill-item">
                    <div class="skill-name">Recipe Development</div>
                    <div class="skill-description">Creating original recipes, testing, and refining</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Advanced Techniques</div>
                    <div class="skill-description">Sous vide, fermentation, molecular gastronomy basics</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Seasonal Cooking</div>
                    <div class="skill-description">Using seasonal ingredients, preserving, canning</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Teaching & Sharing</div>
                    <div class="skill-description">Explaining techniques, hosting dinners, food photography</div>
                </div>
            </div>

            <div class="skills-section">
                <div class="skills-title">Practice Recipes</div>
                <div class="recipes-grid">
                    <div class="recipe-item">Your signature dish</div>
                    <div class="recipe-item">Seasonal tasting menu</div>
                    <div class="recipe-item">Fermented vegetables</div>
                    <div class="recipe-item">Complex multi-course meal</div>
                    <div class="recipe-item">Original fusion cuisine</div>
                    <div class="recipe-item">Competition-worthy dessert</div>
                </div>
            </div>

            <div class="tips-section">
                <div class="tips-title">Pro Tips</div>
                <div class="tip-item">• Never stop learning - cooking is a lifelong journey</div>
                <div class="tip-item">• Share your knowledge and learn from others</div>
                <div class="tip-item">• Focus on ingredients - great cooking starts with great products</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p><strong>Remember:</strong> Progress through each phase at your own pace. Cooking is about practice, patience,
            and passion!</p>
    </div>
</body>

</html>
"""

plan_state_key_exmaple = """
{
        "title": "Public Speaking Starter Plan",
        "steps": [
            {
            "step_1": "**Learn the Basics (Week 1)**\n* **Action:** Study core public speaking principles: structure, body language, tone.\n* **Resources:** Beginner YouTube videos on public speaking (e.g., TEDx Tips).\n* **Question/Challenge:** What are the 3 key traits of a confident speaker?"
            },
            {
            "step_2": "**Practice with Short Talks (Week 2)**\n* **Action:** Prepare a 2-minute talk on a simple topic. Record yourself.\n* **Resources:** Tips on speech structure and timing.\n* **Question/Challenge:** Watch your recording. What did you do well? What can you improve?"
            },
            {
            "step_3": "**Get Feedback (Week 3)**\n* **Action:** Share your recording with a friend or online group. Ask for feedback.\n* **Resources:** Public speaking forums and peer groups.\n* **Question/Challenge:** Based on feedback, list 2 areas to improve and how you'll do it."
            }
        ],
        "questions_and_challenges": [
            {
            "question_1": "What are the 3 key traits of a confident speaker?"
            },
            {
            "question_2": "Watch your recording. What did you do well? What can you improve?"
            },
            {
            "question_3": "Based on feedback, list 2 areas to improve and how you'll do it."
            }
        ]
        }
"""

