// src/pages/admin/PeopleManagement.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import personService from '../../services/personService';

const PeopleManagement = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  useEffect(() => {
    fetchPeople();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPeople(people);
    } else {
      const filtered = people.filter(person => 
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (person.profession && person.profession.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPeople(filtered);
    }
  }, [searchTerm, people]);
  
  const fetchPeople = async () => {
    try {
      setLoading(true);
      const data = await personService.getPeople();
      setPeople(data);
      setFilteredPeople(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching people:', err);
      setError('Failed to load people data. Please try again.');
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (personId) => {
    setConfirmDelete(personId);
  };
  
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };
  
  const handleConfirmDelete = async (personId) => {
    try {
      await personService.deletePerson(personId);
      setPeople(prevPeople => prevPeople.filter(person => person.id !== personId));
      toast.success('Person deleted successfully');
    } catch (error) {
      console.error('Error deleting person:', error);
      toast.error('Failed to delete person');
    } finally {
      setConfirmDelete(null);
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleRetry = () => {
    fetchPeople();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">People Management</h1>
        <Link 
          to="/admin/people/create" 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" />
          Add New Person
        </Link>
      </div>
      
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name or profession..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={handleRetry}
            className="ml-4 text-red-700 font-semibold hover:text-red-900 focus:outline-none focus:underline"
          >
            <FiRefreshCw className="inline mr-1" />
            Try Again
          </button>
        </div>
      )}
      
      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* People count */}
          <p className="text-gray-600 mb-4">
            {filteredPeople.length} {filteredPeople.length === 1 ? 'person' : 'people'} found
            {searchTerm && ' matching your search'}
          </p>
          
          {/* Table */}
          {filteredPeople.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">No people found{searchTerm && ' matching your search criteria'}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profession
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPeople.map(person => (
                    <tr key={person.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {person.image ? (
                          <img 
                            src={person.image} 
                            alt={person.name} 
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            {person.name.charAt(0)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{person.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{person.profession || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{person.slug || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {confirmDelete === person.id ? (
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-red-600">Confirm delete?</span>
                            <button
                              onClick={() => handleConfirmDelete(person.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Yes
                            </button>
                            <button
                              onClick={handleCancelDelete}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/admin/people/edit/${person.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <FiEdit2 className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(person.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PeopleManagement;