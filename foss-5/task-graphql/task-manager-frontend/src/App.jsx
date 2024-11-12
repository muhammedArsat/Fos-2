import { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery, useMutation } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache()
});

const GET_TASKS = gql`
  query GetTasks {
    tasks {
      id
      title
      description
      status
      assignee
      createdAt
      updatedAt
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $description: String, $assignee: String) {
    createTask(title: $title, description: $description, assignee: $assignee) {
      id
      title
      description
      status
      assignee
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String, $description: String, $status: TaskStatus, $assignee: String) {
    updateTask(id: $id, title: $title, description: $description, status: $status, assignee: $assignee) {
      id
      title
      description
      status
      assignee
      updatedAt
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

function TaskList() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  const { loading, error, data } = useQuery(GET_TASKS);
  const [createTask] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }]
  });
  const [updateTask] = useMutation(UPDATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }]
  });
  const [deleteTask] = useMutation(DELETE_TASK, {
    refetchQueries: [{ query: GET_TASKS }]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createTask({ variables: { title, description, assignee } });
    setTitle('');
    setDescription('');
    setAssignee('');
  };

  const handleEdit = (task) => {
    setEditingTask({
      ...task,
      isEditing: true
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateTask({
      variables: {
        id: editingTask.id,
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        assignee: editingTask.assignee
      }
    });
    setEditingTask(null);
  };

  const handleStatusChange = (id, status) => {
    updateTask({
      variables: {
        id,
        status
      }
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Task Manager</h1>

      {/* Add Task Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="text"
          placeholder="Assignee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button
          type="submit"
          style={{
            padding: '5px 10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Task
        </button>
      </form>

      {/* Task List */}
      <div>
        {data.tasks.map(task => (
          <div
            key={task.id}
            style={{
              border: '1px solid #ddd',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '4px'
            }}
          >
            {editingTask?.id === task.id ? (
              // Edit Form
              <form onSubmit={handleUpdate} style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  style={{ marginRight: '10px', padding: '5px', width: '200px' }}
                />
                <input
                  type="text"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  style={{ marginRight: '10px', padding: '5px', width: '200px' }}
                />
                <input
                  type="text"
                  value={editingTask.assignee}
                  onChange={(e) => setEditingTask({...editingTask, assignee: e.target.value})}
                  style={{ marginRight: '10px', padding: '5px', width: '150px' }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '5px'
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTask(null)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#grey',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              // Display Task
              <>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>Assignee: {task.assignee}</p>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ marginRight: '10px' }}>Status: </label>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    style={{ padding: '5px' }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleEdit(task)}
                    style={{
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask({ variables: { id: task.id } })}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
                  {task.updatedAt && <p>Updated: {new Date(task.updatedAt).toLocaleString()}</p>}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <TaskList />
    </ApolloProvider>
  );
}

export default App;