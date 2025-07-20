import React, { useState } from 'react';
import API_BASE_URL from '../config/config';
import '../styles/addcourseMaterials.css'
const AddCourseMaterialForm = ({ courseId, teacherId, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setPdf(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setPdf(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description || !pdf) {
      setMsg({ type: 'danger', text: 'Description and PDF are required' });
      return;
    }

    setLoading(true);
    setMsg(null);

    const payload = {
      course_id: courseId,
      uploaded_by: teacherId,
      description,
      pdf,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/courseMaterials/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      setMsg({ type: 'success', text: data.message });
      setDescription('');
      setPdf(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <form onSubmit={handleSubmit} className="add-material-form d-grid gap-3 p-3 bg-light rounded">
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <textarea
        className="form-control"
        placeholder="Enter description (1 or 2 lines)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows="3"
        required
      />

      <input
        type="file"
        className="form-control"
        accept="application/pdf"
        onChange={handleFileChange}
      />

      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
        {loading ? 'Uploading…' : 'Add Material'}
      </button>
    </form>
  );
};

export default AddCourseMaterialForm;
