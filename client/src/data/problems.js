/**
 * Practice Problems Library
 * Organized by: subject > level > problems[]
 * Each problem has: id, title, description, hints, starterCode (for coding), language
 */

const PROBLEMS = {
  coding: {
    beginner: [
      {
        id: "c-b-1",
        title: "Hello World",
        description:
          "Write a program that prints 'Hello, World!' to the console.",
        hints: ["Use print() in Python or console.log() in JavaScript."],
        language: "python",
        starterCode: "# Write your code here\n",
        expectedOutput: "Hello, World!",
      },
      {
        id: "c-b-2",
        title: "Sum of Two Numbers",
        description:
          "Read two integers from input and print their sum.\n\n**Input:** Two integers on separate lines\n**Output:** Their sum",
        hints: [
          "Use input() to read values",
          "Convert strings to int with int()",
        ],
        language: "python",
        starterCode:
          "# Read two numbers and print their sum\na = int(input())\nb = int(input())\n# Your code here\n",
        testCases: [
          { stdin: "3\n5", expected: "8" },
          { stdin: "10\n20", expected: "30" },
          { stdin: "-1\n1", expected: "0" },
        ],
      },
      {
        id: "c-b-3",
        title: "Even or Odd",
        description:
          "Read an integer and print 'Even' if it's even, 'Odd' if it's odd.",
        hints: ["Use the modulo operator %", "n % 2 == 0 means even"],
        language: "python",
        starterCode: "n = int(input())\n# Check if even or odd\n",
        testCases: [
          { stdin: "4", expected: "Even" },
          { stdin: "7", expected: "Odd" },
          { stdin: "0", expected: "Even" },
        ],
      },
      {
        id: "c-b-4",
        title: "Reverse a String",
        description: "Read a string and print it reversed.",
        hints: ["Python: use slicing s[::-1]", "Or loop from end to start"],
        language: "python",
        starterCode: "s = input()\n# Print reversed string\n",
        testCases: [
          { stdin: "hello", expected: "olleh" },
          { stdin: "BrainCoder", expected: "redoCniarB" },
          { stdin: "a", expected: "a" },
        ],
      },
      {
        id: "c-b-5",
        title: "FizzBuzz",
        description:
          "Print numbers 1 to N. For multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', for both print 'FizzBuzz'.",
        hints: [
          "Check divisibility by 15 first (both 3 and 5)",
          "Use a for loop from 1 to N inclusive",
        ],
        language: "python",
        starterCode: "n = int(input())\nfor i in range(1, n+1):\n    # Your code here\n    pass\n",
        testCases: [
          { stdin: "5", expected: "1\n2\nFizz\n4\nBuzz" },
          { stdin: "15", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" },
        ],
      },
    ],
    intermediate: [
      {
        id: "c-i-1",
        title: "Fibonacci Sequence",
        description:
          "Print the first N Fibonacci numbers (space-separated).\n\n**Input:** Integer N\n**Output:** First N Fibonacci numbers",
        hints: [
          "Start with 0, 1",
          "Each next number = sum of previous two",
        ],
        language: "python",
        starterCode: "n = int(input())\n# Print first n Fibonacci numbers\n",
        testCases: [
          { stdin: "5", expected: "0 1 1 2 3" },
          { stdin: "8", expected: "0 1 1 2 3 5 8 13" },
        ],
      },
      {
        id: "c-i-2",
        title: "Palindrome Check",
        description: "Read a string and print 'Yes' if it's a palindrome, 'No' otherwise (case-insensitive).",
        hints: ["Convert to lowercase first", "Compare with reversed version"],
        language: "python",
        starterCode: "s = input().lower()\n# Check palindrome\n",
        testCases: [
          { stdin: "Racecar", expected: "Yes" },
          { stdin: "hello", expected: "No" },
          { stdin: "madam", expected: "Yes" },
        ],
      },
      {
        id: "c-i-3",
        title: "Prime Numbers",
        description: "Print all prime numbers up to N (one per line).",
        hints: [
          "A prime is divisible only by 1 and itself",
          "Check divisibility up to sqrt(n)",
        ],
        language: "python",
        starterCode: "n = int(input())\n# Print all primes up to n\n",
        testCases: [
          { stdin: "10", expected: "2\n3\n5\n7" },
          { stdin: "20", expected: "2\n3\n5\n7\n11\n13\n17\n19" },
        ],
      },
      {
        id: "c-i-4",
        title: "Matrix Transpose",
        description:
          "Read a matrix (first line: rows cols, then matrix) and print its transpose.\n\n**Input:**\n```\n2 3\n1 2 3\n4 5 6\n```\n**Output:**\n```\n1 4\n2 5\n3 6\n```",
        hints: ["Transpose swaps rows and columns", "Use zip() in Python"],
        language: "python",
        starterCode:
          "r, c = map(int, input().split())\nmatrix = []\nfor _ in range(r):\n    row = list(map(int, input().split()))\n    matrix.append(row)\n# Print transpose\n",
        testCases: [
          { stdin: "2 3\n1 2 3\n4 5 6", expected: "1 4\n2 5\n3 6" },
        ],
      },
    ],
    advanced: [
      {
        id: "c-a-1",
        title: "Binary Search",
        description:
          "Implement binary search. Input: sorted array (space-separated), then target. Print the 0-based index or -1 if not found.",
        hints: [
          "Maintain low and high pointers",
          "mid = (low + high) // 2",
        ],
        language: "python",
        starterCode:
          "arr = list(map(int, input().split()))\ntarget = int(input())\n# Implement binary search\n",
        testCases: [
          { stdin: "1 3 5 7 9 11\n7", expected: "3" },
          { stdin: "2 4 6 8 10\n5", expected: "-1" },
        ],
      },
      {
        id: "c-a-2",
        title: "Merge Sort",
        description:
          "Implement merge sort. Read N numbers (space-separated) and print them sorted.",
        hints: [
          "Divide array into halves recursively",
          "Merge sorted halves back together",
        ],
        language: "python",
        starterCode:
          "arr = list(map(int, input().split()))\n# Implement merge sort and print sorted array\n",
        testCases: [
          { stdin: "5 2 8 1 9 3", expected: "1 2 3 5 8 9" },
          { stdin: "10 1 7 3", expected: "1 3 7 10" },
        ],
      },
      {
        id: "c-a-3",
        title: "LRU Cache",
        description:
          "Implement an LRU Cache with capacity K.\nInput: first line K, then operations: 'GET key' or 'PUT key value'.\nFor GET: print value or -1.\nFor PUT: no output.\n\nExample:\n```\n2\nPUT 1 10\nPUT 2 20\nGET 1\nPUT 3 30\nGET 2\n```\nOutput:\n```\n10\n-1\n```",
        hints: [
          "Use OrderedDict or dict + doubly linked list",
          "On access, move item to end (most recent)",
          "On capacity overflow, remove first (least recent)",
        ],
        language: "python",
        starterCode:
          "from collections import OrderedDict\n\nk = int(input())\n# Implement LRU Cache\n",
        testCases: [
          {
            stdin: "2\nPUT 1 10\nPUT 2 20\nGET 1\nPUT 3 30\nGET 2",
            expected: "10\n-1",
          },
        ],
      },
    ],
  },
  math: {
    beginner: [
      {
        id: "m-b-1",
        title: "Basic Arithmetic",
        description:
          "Calculate and verify:\n\n1. What is $25 \\times 13$?\n2. What is $144 \\div 12$?\n3. What is $7^3$?\n\nWrite a program to compute and print the answers (one per line).",
        hints: ["Use *, //, and ** operators"],
        language: "python",
        starterCode: "# Calculate:\n# 25 * 13\n# 144 / 12\n# 7^3\n",
        testCases: [{ stdin: "", expected: "325\n12\n343" }],
      },
      {
        id: "m-b-2",
        title: "Area of a Circle",
        description:
          "Given radius r, calculate the area of a circle using $A = \\pi r^2$. Print result rounded to 2 decimal places.",
        hints: ["import math; use math.pi", "round(value, 2)"],
        language: "python",
        starterCode: "import math\nr = float(input())\n# Calculate area\n",
        testCases: [
          { stdin: "5", expected: "78.54" },
          { stdin: "1", expected: "3.14" },
        ],
      },
      {
        id: "m-b-3",
        title: "GCD (Greatest Common Divisor)",
        description: "Find the GCD of two numbers using Euclid's algorithm.",
        hints: [
          "GCD(a,b) = GCD(b, a%b)",
          "Base case: GCD(a, 0) = a",
        ],
        language: "python",
        starterCode: "a = int(input())\nb = int(input())\n# Find GCD\n",
        testCases: [
          { stdin: "12\n8", expected: "4" },
          { stdin: "54\n24", expected: "6" },
        ],
      },
    ],
    intermediate: [
      {
        id: "m-i-1",
        title: "Quadratic Equation Solver",
        description:
          "Solve $ax^2 + bx + c = 0$. Print roots rounded to 2 decimals (smaller first). If no real roots, print 'No real roots'.",
        hints: [
          "Discriminant D = b² - 4ac",
          "If D < 0, no real roots",
          "Roots: (-b ± √D) / 2a",
        ],
        language: "python",
        starterCode:
          "import math\na, b, c = map(float, input().split())\n# Solve quadratic\n",
        testCases: [
          { stdin: "1 -5 6", expected: "2.0\n3.0" },
          { stdin: "1 0 1", expected: "No real roots" },
        ],
      },
      {
        id: "m-i-2",
        title: "Matrix Multiplication",
        description:
          "Multiply two 2x2 matrices.\nInput: 4 values for matrix A (row by row), then 4 for matrix B.\nOutput: Resulting 2x2 matrix.",
        hints: [
          "C[i][j] = sum(A[i][k] * B[k][j] for k)",
          "For 2x2: straightforward 4 multiplications per element",
        ],
        language: "python",
        starterCode:
          "# Read matrix A (2x2)\na = list(map(int, input().split()))\n# Read matrix B (2x2)\nb = list(map(int, input().split()))\n# Multiply and print result\n",
        testCases: [
          { stdin: "1 2 3 4\n5 6 7 8", expected: "19 22\n43 50" },
        ],
      },
    ],
    advanced: [
      {
        id: "m-a-1",
        title: "Numerical Integration (Simpson's Rule)",
        description:
          "Compute the definite integral of $f(x) = x^2$ from $a$ to $b$ using Simpson's 1/3 rule with $n$ subintervals.\nInput: a b n\nOutput: Result rounded to 4 decimal places.",
        hints: [
          "Simpson's rule: (h/3)[f(a) + 4f(a+h) + 2f(a+2h) + ... + f(b)]",
          "h = (b-a)/n, n must be even",
        ],
        language: "python",
        starterCode:
          "a, b, n = map(float, input().split())\nn = int(n)\n# Simpson's 1/3 rule for f(x) = x^2\n",
        testCases: [
          { stdin: "0 1 100", expected: "0.3333" },
          { stdin: "0 3 100", expected: "9.0" },
        ],
      },
      {
        id: "m-a-2",
        title: "Fast Power (Modular Exponentiation)",
        description:
          "Compute $(base^{exp}) \\mod m$ efficiently.\nInput: base exp mod\nOutput: result",
        hints: [
          "Use binary exponentiation",
          "If exp is odd: result *= base",
          "Square base and halve exp each step",
        ],
        language: "python",
        starterCode: "base, exp, mod = map(int, input().split())\n# Fast modular exponentiation\n",
        testCases: [
          { stdin: "2 10 1000", expected: "24" },
          { stdin: "3 13 7", expected: "3" },
        ],
      },
    ],
  },
  physics: {
    beginner: [
      {
        id: "p-b-1",
        title: "Speed, Distance, Time",
        description:
          "Given distance (m) and time (s), calculate speed.\n$v = d / t$\nPrint speed rounded to 2 decimal places.",
        hints: ["speed = distance / time", "Use round(v, 2)"],
        language: "python",
        starterCode: "d = float(input())  # distance in meters\nt = float(input())  # time in seconds\n# Calculate speed\n",
        testCases: [
          { stdin: "100\n9.58", expected: "10.44" },
          { stdin: "50\n5", expected: "10.0" },
        ],
      },
      {
        id: "p-b-2",
        title: "Newton's Second Law",
        description:
          "Given mass (kg) and acceleration (m/s²), calculate force.\n$F = m \\times a$\nPrint force rounded to 2 decimal places.",
        hints: ["F = m * a"],
        language: "python",
        starterCode: "m = float(input())  # mass in kg\na = float(input())  # acceleration in m/s²\n# Calculate force\n",
        testCases: [
          { stdin: "10\n9.8", expected: "98.0" },
          { stdin: "5\n3", expected: "15.0" },
        ],
      },
      {
        id: "p-b-3",
        title: "Kinetic Energy",
        description:
          "Calculate kinetic energy: $KE = \\frac{1}{2}mv^2$\nInput: mass (kg), velocity (m/s)\nOutput: KE rounded to 2 decimal places.",
        hints: ["KE = 0.5 * m * v * v"],
        language: "python",
        starterCode: "m = float(input())\nv = float(input())\n# Calculate KE\n",
        testCases: [
          { stdin: "2\n3", expected: "9.0" },
          { stdin: "10\n5", expected: "125.0" },
        ],
      },
    ],
    intermediate: [
      {
        id: "p-i-1",
        title: "Projectile Motion",
        description:
          "A ball is thrown with velocity $v$ at angle $\\theta$ degrees.\nCalculate:\n1. Maximum height: $H = \\frac{v^2 \\sin^2\\theta}{2g}$\n2. Range: $R = \\frac{v^2 \\sin(2\\theta)}{g}$\n\nUse g = 9.8. Print H and R rounded to 2 decimals (separate lines).",
        hints: [
          "Convert degrees to radians: math.radians(theta)",
          "Use math.sin()",
        ],
        language: "python",
        starterCode:
          "import math\nv = float(input())  # velocity m/s\ntheta = float(input())  # angle in degrees\ng = 9.8\n# Calculate H and R\n",
        testCases: [
          { stdin: "20\n45", expected: "10.2\n40.82" },
          { stdin: "10\n30", expected: "1.28\n8.84" },
        ],
      },
      {
        id: "p-i-2",
        title: "Simple Harmonic Motion Period",
        description:
          "Calculate the time period of a simple pendulum:\n$T = 2\\pi\\sqrt{\\frac{L}{g}}$\n\nInput: Length L (m)\nOutput: T rounded to 3 decimal places. Use g = 9.8.",
        hints: ["T = 2 * pi * sqrt(L/g)"],
        language: "python",
        starterCode: "import math\nL = float(input())\ng = 9.8\n# Calculate period\n",
        testCases: [
          { stdin: "1", expected: "2.007" },
          { stdin: "0.25", expected: "1.003" },
        ],
      },
    ],
    advanced: [
      {
        id: "p-a-1",
        title: "Relativistic Energy",
        description:
          "Calculate total relativistic energy:\n$E = \\gamma m c^2$ where $\\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}}$\n\nInput: mass (kg), velocity (m/s)\nOutput: Energy in Joules (scientific notation, 4 significant figures)\nUse c = 3e8 m/s.",
        hints: [
          "gamma = 1 / sqrt(1 - (v/c)^2)",
          "E = gamma * m * c^2",
          "Format: f'{E:.4e}'",
        ],
        language: "python",
        starterCode:
          "import math\nm = float(input())\nv = float(input())\nc = 3e8\n# Calculate relativistic energy\n",
        testCases: [
          { stdin: "1\n0", expected: "9.0000e+16" },
          { stdin: "1\n2.6e8", expected: "1.8000e+17" },
        ],
      },
      {
        id: "p-a-2",
        title: "Orbital Velocity",
        description:
          "Calculate orbital velocity at height h above Earth's surface:\n$v = \\sqrt{\\frac{GM}{R+h}}$\n\nG = 6.674e-11, M = 5.972e24 kg, R = 6.371e6 m\nInput: height h in meters\nOutput: orbital velocity in m/s rounded to 1 decimal.",
        hints: [
          "v = sqrt(G*M / (R+h))",
          "LEO (~400km) gives about 7672 m/s",
        ],
        language: "python",
        starterCode:
          "import math\nh = float(input())\nG = 6.674e-11\nM = 5.972e24\nR = 6.371e6\n# Calculate orbital velocity\n",
        testCases: [
          { stdin: "400000", expected: "7672.6" },
          { stdin: "0", expected: "7909.8" },
        ],
      },
    ],
  },
};

export default PROBLEMS;
