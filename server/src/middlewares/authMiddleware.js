import jwt from "jsonwebtoken";

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded; // Add user info to request
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token has expired" 
      });
    }
    return res.status(400).json({ 
      success: false, 
      message: "Invalid token" 
    });
  }
};

// Middleware to verify admin role
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.userType !== "Admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin privileges required" 
      });
    }
    next();
  });
};

// Middleware to verify student role
export const verifyStudent = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.userType !== "Student") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Student privileges required" 
      });
    }
    next();
  });
};

// Middleware to verify candidate role
export const verifyCandidate = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.userType !== "Candidate") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Candidate privileges required" 
      });
    }
    next();
  });
};

// Middleware to verify student or candidate role
export const verifyStudentOrCandidate = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!["Student", "Candidate"].includes(req.user.userType)) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Student or Candidate privileges required" 
      });
    }
    next();
  });
};

// Middleware to verify any authenticated user
export const verifyAnyUser = verifyToken;