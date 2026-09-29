import { useEffect, useState } from 'react'
import '../style/addtask.css'
import { useNavigate, useParams } from 'react-router-dom';

export default function UpdateTask() {

    const [taskData, setTaskData] = useState();
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        getTask(id);
    }, []);

    const getTask = async (id) => {

        let task = await fetch(`http://localhost:3200/task/` + id, {
            credentials: 'include'
        });

        task = await task.json();

        if (task.result) {
            setTaskData(task.result);
        }
    }

    const updateTask = async () => {

        console.log("function called", taskData);

        let task = await fetch("http://localhost:3200/update-task", {
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify(taskData),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        task = await task.json();

        if (task.success) {
            navigate('/');
        }
    }

    return (
        <div className="container">

            <h1>Update Task</h1>

            <label htmlFor="">Title</label>

            <input
                value={taskData?.title || ''}
                onChange={(event) =>
                    setTaskData({
                        ...taskData,
                        title: event.target.value
                    })
                }
                type="text"
                name="title"
                placeholder="Enter task title"
            />

            <label htmlFor="">Description</label>

            <textarea
                value={taskData?.description || ''}
                onChange={(event) =>
                    setTaskData({
                        ...taskData,
                        description: event.target.value
                    })
                }
                rows={4}
                name="description"
                placeholder="Enter task description"
            ></textarea>

            <button
                onClick={updateTask}
                className="submit"
            >
                Update Task
            </button>

        </div>
    )
}