import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const serializeStudent = (student) => {
  return {
    ...student,
    Std_id: student.Std_id.toString(),
  };
};

const serializeStudents = (students) => {
  return students.map(serializeStudent);
};

// Get all students (Admin only)
export const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.sTUDENT.findMany({
      select: {
        Std_id: true,
        Std_name: true,
        Std_email: true,
        Std_phone: true,
        Dob: true,
        User_type: true,
      },
      orderBy: {
        Std_name: "asc",
      },
    });

    const serializedStudents = serializeStudents(students);

    res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      data: { students: serializedStudents },
    });
  } catch (error) {
    console.error("Get all students error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get student by ID (Admin only)
export const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await prisma.sTUDENT.findUnique({
      where: { Std_id: BigInt(studentId) },
      select: {
        Std_id: true,
        Std_name: true,
        Std_email: true,
        Std_phone: true,
        Dob: true,
        User_type: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const serializedStudent = serializeStudent(student);

    res.status(200).json({
      success: true,
      message: "Student retrieved successfully",
      data: { student: serializedStudent },
    });
  } catch (error) {
    console.error("Get student by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get student statistics (Admin only)
export const getStudentStats = async (req, res) => {
  try {
    const totalStudents = await prisma.sTUDENT.count();
    
    const studentsWhoVoted = await prisma.vOTE.findMany({
      distinct: ['Std_id'],
      select: {
        Std_id: true,
      },
    });

    const studentCandidates = await prisma.cANDIDATE.findMany({
      select: {
        Can_id: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Student statistics retrieved successfully",
      data: {
        totalStudents,
        activeVoters: studentsWhoVoted.length,
        studentCandidates: studentCandidates.length,
      },
    });
  } catch (error) {
    console.error("Get student stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get student voting history (Admin only)
export const getStudentVotingHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const votes = await prisma.vOTE.findMany({
      where: {
        Std_id: BigInt(studentId),
      },
      include: {
        election: {
          select: {
            Election_id: true,
            Title: true,
            Start_date: true,
            End_date: true,
          },
        },
        candidate: {
          select: {
            Can_name: true,
            Position: true,
          },
        },
      },
      orderBy: {
        Vote_time: "desc",
      },
    });

    const formattedVotes = votes.map((vote) => ({
      voteId: vote.Vote_id,
      election: {
        id: vote.election.Election_id,
        title: vote.election.Title,
        startDate: vote.election.Start_date,
        endDate: vote.election.End_date,
      },
      candidate: {
        name: vote.candidate.Can_name,
        position: vote.candidate.Position,
      },
      voteTime: vote.Vote_time,
    }));

    res.status(200).json({
      success: true,
      message: "Voting history retrieved successfully",
      data: { votes: formattedVotes },
    });
  } catch (error) {
    console.error("Get voting history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
