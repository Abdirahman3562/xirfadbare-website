import React from 'react';
import { useParams } from 'react-router-dom';

const EditCourse = () => {
    const { id } = useParams();
    return (
        <div>
            <h2 className="text-xl font-semibold">Edit Course: {id}</h2>
            <p>Form to edit course details.</p>
        </div>
    );
};

export default EditCourse;
