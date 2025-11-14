import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import * as AdminAPI from '../../utils/adminAPI';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  CheckBadgeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [votingHistory, setVotingHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeVoters: 0,
    studentCandidates: 0,
  });

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAllStudents();
      
      if (response.success) {
        setStudents(response.data.students);
        setFilteredStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await AdminAPI.getStudentStats();
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterStudents = () => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(
      (student) =>
        student.Std_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.Std_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.Std_id.toString().includes(searchTerm)
    );
    setFilteredStudents(filtered);
  };

  const viewStudentDetails = async (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
    
    // Fetch voting history
    try {
      setLoadingHistory(true);
      const response = await AdminAPI.getStudentVotingHistory(student.Std_id);
      
      if (response.success) {
        setVotingHistory(response.data.votes);
      }
    } catch (error) {
      console.error('Error fetching voting history:', error);
      setVotingHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedStudent(null);
    setVotingHistory([]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-8 pt-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <UserGroupIcon className="h-10 w-10 text-blue-600" />
            Student Management
          </h1>
          <p className="text-gray-600 mt-3 text-lg">View and manage student information</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">Total Students</p>
                <p className="text-4xl font-bold text-blue-600">{stats.totalStudents}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-2xl">
                <UserGroupIcon className="h-10 w-10 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">Active Voters</p>
                <p className="text-4xl font-bold text-green-600">{stats.activeVoters}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-2xl">
                <CheckBadgeIcon className="h-10 w-10 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">Student Candidates</p>
                <p className="text-4xl font-bold text-purple-600">{stats.studentCandidates}</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-2xl">
                <ClockIcon className="h-10 w-10 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-gray-700 text-lg placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No students found' : 'No students registered'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Students will appear here once they register'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.Std_id} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {student.Std_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.Std_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.Std_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.Std_phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(student.Dob)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => viewStudentDetails(student)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
                      >
                        <EyeIcon className="h-5 w-5" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Info */}
        {!loading && filteredStudents.length > 0 && (
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200">
            <p className="text-sm font-medium text-gray-700">
              Showing <span className="font-bold text-blue-600">{filteredStudents.length}</span> of <span className="font-bold text-blue-600">{students.length}</span> students
            </p>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
                Student Details
              </h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-200 rounded-full p-2"
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Student ID</p>
                    <p className="text-lg font-bold text-gray-900">{selectedStudent.Std_id}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                    <p className="text-lg font-bold text-gray-900">{selectedStudent.Std_name}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-base font-medium text-gray-900 break-all">{selectedStudent.Std_email}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                    <p className="text-lg font-medium text-gray-900">{selectedStudent.Std_phone}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date of Birth</p>
                    <p className="text-lg font-medium text-gray-900">
                      {formatDate(selectedStudent.Dob)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">User Type</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {selectedStudent.User_type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Voting History */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckBadgeIcon className="h-6 w-6 text-green-600" />
                  </div>
                  Voting History
                </h3>
                
                {loadingHistory ? (
                  <div className="flex justify-center items-center py-12 bg-gray-50 rounded-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : votingHistory.length === 0 ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl text-center border border-gray-200">
                    <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No voting history available</p>
                    <p className="text-sm text-gray-500 mt-2">This student hasn't participated in any elections yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {votingHistory.map((vote) => (
                      <div
                        key={vote.voteId}
                        className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border-l-4 border-green-500 shadow-md hover:shadow-lg transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 mb-2">{vote.election.title}</h4>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                Status: <span className="font-semibold text-green-700">Vote Cast Successfully</span>
                              </p>
                              
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              Participated
                            </span>
                            <p className="text-xs text-gray-500 mt-2">{formatDateTime(vote.voteTime)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                          <span className="font-medium">Election Period:</span>
                          <span>{formatDate(vote.election.startDate)} - {formatDate(vote.election.endDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <button
                onClick={closeDetailsModal}
                className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-xl hover:from-gray-300 hover:to-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentManagement;