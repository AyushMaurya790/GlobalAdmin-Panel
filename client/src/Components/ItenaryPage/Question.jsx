import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaSpinner, 
  FaGlobe,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaWindowClose,
  FaSearch,
  FaQuestionCircle,
  FaArrowUp,
  FaArrowDown,
  FaCaretDown,
  FaCaretUp
} from 'react-icons/fa';
import { questionsAPI } from '../../services/questionsAPI';
import { countryAPI, continentAPI } from '../../services/itenaryAPI';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Question = () => {
  // State for questions
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // State for form data
  const [formData, setFormData] = useState({
    country: '',
    questions: ['']
  });
  
  // State for form visuals
  const [editingId, setEditingId] = useState(null);
  const [expandedSet, setExpandedSet] = useState(null);
  
  // State for countries/continents filtering
  const [countries, setCountries] = useState([]);
  const [continents, setContinents] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch question sets
  const fetchQuestionSets = async () => {
    setLoading(true);
    try {
      const data = await questionsAPI.getAll();
      setQuestionSets(data);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch questions' });
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch countries based on continent filter
  const fetchCountries = async (continentId = '') => {
    try {
      const data = await countryAPI.getAll(continentId);
      setCountries(data);
    } catch (error) {
      toast.error('Failed to fetch countries');
    }
  };
  
  // Fetch continents
  const fetchContinents = async () => {
    try {
      const data = await continentAPI.getAll();
      setContinents(data);
    } catch (error) {
      toast.error('Failed to fetch continents');
    }
  };
  
  // Initial data loading
  useEffect(() => {
    fetchQuestionSets();
    fetchContinents();
    fetchCountries();
  }, []);
  
  // Update countries when continent filter changes
  useEffect(() => {
    fetchCountries(selectedContinent);
  }, [selectedContinent]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle question input changes
  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = value;
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  // Add new question
  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, '']
    }));
  };
  
  // Remove question
  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      toast.warning('At least one question is required');
      return;
    }
    
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  // Move question up
  const moveQuestionUp = (index) => {
    if (index === 0) return; // Already at the top
    
    const updatedQuestions = [...formData.questions];
    const temp = updatedQuestions[index];
    updatedQuestions[index] = updatedQuestions[index - 1];
    updatedQuestions[index - 1] = temp;
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  // Move question down
  const moveQuestionDown = (index) => {
    if (index === formData.questions.length - 1) return; // Already at the bottom
    
    const updatedQuestions = [...formData.questions];
    const temp = updatedQuestions[index];
    updatedQuestions[index] = updatedQuestions[index + 1];
    updatedQuestions[index + 1] = temp;
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validation
      if (!formData.country) {
        throw new Error('Country is required');
      }
      
      // Validate all questions have content
      const invalidQuestions = formData.questions.some(q => !q.trim());
      if (invalidQuestions) {
        throw new Error('All questions must have content');
      }
      
      // Create or update questions
      let response;
      if (editingId) {
        response = await questionsAPI.update(editingId, { questions: formData.questions });
        toast.success('Questions updated successfully');
      } else {
        response = await questionsAPI.create(formData);
        toast.success('Questions created successfully');
      }
      
      // Reset form
      resetForm();
      
      // Refresh question sets list
      fetchQuestionSets();
      
    } catch (error) {
      toast.error(error.message || 'Failed to save questions');
      setMessage({ type: 'error', text: error.message || 'Failed to save questions' });
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      country: '',
      questions: ['']
    });
    
    // Clear editing state
    setEditingId(null);
  };
  
  // Handle edit questions
  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const questionSet = await questionsAPI.getById(id);
      
      setFormData({
        country: questionSet.country._id || questionSet.country,
        questions: questionSet.questions.length > 0 ? questionSet.questions : ['']
      });
      
      setEditingId(id);
      
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      toast.error('Failed to load questions for editing');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete questions
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete these questions?')) {
      setLoading(true);
      try {
        await questionsAPI.delete(id);
        toast.success('Questions deleted successfully');
        fetchQuestionSets();
      } catch (error) {
        toast.error('Failed to delete questions');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Toggle expanded set
  const toggleExpanded = (id) => {
    setExpandedSet(expandedSet === id ? null : id);
  };
  
  // Filter countries by search term
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h1 className="text-2xl font-bold mb-6">
        <FaQuestionCircle className="inline mr-2 text-blue-500" /> 
        Questions Management
      </h1>
      
      {/* Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Questions' : 'Add New Questions'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Country Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">
              <FaGlobe className="inline mr-2" /> Continent Filter
            </label>
            <select
              className="w-full p-2 border rounded"
              value={selectedContinent}
              onChange={(e) => setSelectedContinent(e.target.value)}
              disabled={editingId}
            >
              <option value="">All Continents</option>
              {continents.map(continent => (
                <option key={continent._id} value={continent._id}>
                  {continent.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">
              <FaMapMarkerAlt className="inline mr-2" /> Country
            </label>
            <div className="mb-2">
              <input
                type="text"
                placeholder="Search countries..."
                className="p-2 border rounded w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={editingId}
              />
            </div>
            <select
              name="country"
              className="w-full p-2 border rounded"
              value={formData.country}
              onChange={handleInputChange}
              required
              disabled={editingId}
            >
              <option value="">Select Country</option>
              {filteredCountries.map(country => (
                <option key={country._id} value={country._id}>
                  {country.name}
                </option>
              ))}
            </select>
            {editingId && (
              <p className="text-sm text-gray-500 mt-1">
                Country cannot be changed when editing. To change country, delete this set and create a new one.
              </p>
            )}
          </div>
          
          {/* Questions */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-700">
                <FaQuestionCircle className="inline mr-2" /> Questions
              </label>
              <button
                type="button"
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center"
                onClick={addQuestion}
              >
                <FaPlus className="mr-1" /> Add Question
              </button>
            </div>
            
            {formData.questions.map((question, index) => (
              <div key={index} className="flex items-start space-x-2 mb-2">
                <div className="flex flex-col space-y-1">
                  <button
                    type="button"
                    className={`p-1 rounded ${index === 0 ? 'text-gray-400' : 'text-blue-500 hover:bg-blue-100'}`}
                    onClick={() => moveQuestionUp(index)}
                    disabled={index === 0}
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    type="button"
                    className={`p-1 rounded ${index === formData.questions.length - 1 ? 'text-gray-400' : 'text-blue-500 hover:bg-blue-100'}`}
                    onClick={() => moveQuestionDown(index)}
                    disabled={index === formData.questions.length - 1}
                  >
                    <FaArrowDown />
                  </button>
                </div>
                <textarea
                  className="flex-grow p-2 border rounded"
                  value={question}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  placeholder={`Enter question #${index + 1}`}
                  rows="2"
                  required
                />
                <button
                  type="button"
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  onClick={() => removeQuestion(index)}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          
          {/* Submit and Cancel Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Processing...
                </>
              ) : (
                <>
                  <FaCheckCircle className="mr-2" /> {editingId ? 'Update' : 'Save'}
                </>
              )}
            </button>
            
            {editingId && (
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center"
                onClick={resetForm}
                disabled={loading}
              >
                <FaWindowClose className="mr-2" /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Questions List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Questions Sets</h2>
        
        {loading && !editingId ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-3xl text-blue-500" />
          </div>
        ) : questionSets.length === 0 ? (
          <div className="bg-gray-100 p-4 text-center rounded">
            No question sets found. Add your first one!
          </div>
        ) : (
          <div className="space-y-4">
            {questionSets.map(set => (
              <div key={set._id} className="border rounded-lg shadow-sm overflow-hidden">
                <div 
                  className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpanded(set._id)}
                >
                  <div>
                    <h3 className="font-bold">
                      <FaQuestionCircle className="inline mr-2 text-blue-500" />
                      {set.country?.name || 'Unknown Country'} Questions
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {set.questions?.length || 0} questions
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(set._id);
                      }}
                      className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(set._id);
                      }}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      <FaTrash />
                    </button>
                    {expandedSet === set._id ? <FaCaretUp /> : <FaCaretDown />}
                  </div>
                </div>
                
                {/* Expanded content */}
                {expandedSet === set._id && (
                  <div className="p-4 bg-white">
                    <ol className="list-decimal pl-6 space-y-2">
                      {set.questions && set.questions.map((question, idx) => (
                        <li key={idx} className="text-gray-800">{question}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Question;
