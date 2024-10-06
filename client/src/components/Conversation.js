import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import { getConversation, generateAIResponse, getCompletion, updateCompletion, editResource } from '../services/api';
import './Conversation.css';
import LoadingSpinner from './LoadingSpinner';
import BubblePopperGame from './BubblePopperGame';
import LoadingQuiz from './LoadingQuiz';
import CompletionModal from './CompletionModal';

const Conversation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [conversation, setConversation] = useState(null);
    const [courseSchedule, setCourseSchedule] = useState(null);
    const [completedItems, setCompletedItems] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [level, setLevel] = useState('');
    const [duration, setDuration] = useState('');
    const [aiResponding, setAiResponding] = useState(false);
    const [apiLimitReached, setApiLimitReached] = useState(false);
    const [allCompleted, setAllCompleted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [apiUsage, setApiUsage] = useState({
        currentUsage: 0,
        limit: 0,
        tier: ''
    });
    const [editingResource, setEditingResource] = useState(null);
    const [newResourceType, setNewResourceType] = useState('');

    const messagesEndRef = useRef(null);

    // Function to scroll to bottom
    // const scrollToBottom = () => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // };

    const handleEditResource = (weekNum, dayNum, time, contentId, resourceId, forItem) => {
        setEditingResource({ weekNum, dayNum, time, contentId, resourceId, forItem });
    };

    const handleSaveResource = async () => {
        if (!editingResource || !newResourceType) return;

        const { weekNum, dayNum, time, contentId, resourceId, forItem } = editingResource;
        try {
            const response = await editResource(newResourceType, time, weekNum, dayNum, contentId, resourceId, id, conversation);
            try {
                const updatedConversation = await getConversation(id);
                setConversation(updatedConversation.data);
                toast.success('Resource updated successfully');
            } catch {
                toast.error("Error in fetching updated conversation");
            }
            // Update the local state to reflect the change
        } catch (error) {
            console.error('Error updating resource:', error);
            toast.error('Failed to update resource');
        } finally {
            setEditingResource(null);
            setNewResourceType('');
        }
    };



    // Use effect to scroll to bottom when messages change
    // useEffect(() => {
    //     scrollToBottom();
    // }, [conversation]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [convData, completionData] = await Promise.all([
                    getConversation(id),
                    getCompletion(id)
                ]);
                setConversation(convData.data);
                setCompletedItems(new Set(completionData.data.completedItems));

                if (convData.data.messages && convData.data.messages.length > 0) {
                    const lastAiMessage = convData.data.messages.find(m => m.role === 'assistant');
                    if (lastAiMessage) {
                        try {
                            const scheduleData = JSON.parse(lastAiMessage.content);
                            setCourseSchedule(scheduleData);
                        } catch (e) {
                            console.error('Error parsing course schedule:', e);
                        }
                    }
                }
                setShowForm(convData.data.messages.length === 0);
            } catch (err) {
                console.error('Error fetching data:', err);
                toast.error('Failed to load conversation data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (apiLimitReached) return;
        setAiResponding(true);
        try {
            const formInput = `Topic: ${conversation.title}, Level: ${level}, Duration: ${duration}`;
            const response = await generateAIResponse(id,
                conversation.title,
                level,
                duration
            );
            const updatedConversation = await getConversation(id);
            setConversation(updatedConversation.data);
            setShowForm(false);

            // Parse the new course schedule
            const lastAiMessage = updatedConversation.data.messages.find(m => m.role === 'assistant');
            if (lastAiMessage) {
                try {
                    const scheduleData = JSON.parse(lastAiMessage.content);
                    setCourseSchedule(scheduleData);
                } catch (e) {
                    console.error('Error parsing course schedule:', e);
                }
            }
            updateApiUsage(response);
        } catch (error) {
            console.error('Error generating initial AI response:', error);
            handleApiError(error);
        } finally {
            setAiResponding(false);
        }
    };

    const handleSendMessage = useCallback(async () => {
        if (input.trim() && !aiResponding && !apiLimitReached) {
            setAiResponding(true);
            try {
                const response = await generateAIResponse(id, input);
                setInput('');
                const updatedConversation = await getConversation(id);
                setConversation(updatedConversation.data);
                updateApiUsage(response);
            } catch (error) {
                console.error('Error sending message:', error);
                handleApiError(error);
            } finally {
                setAiResponding(false);
            }
        }
    }, [input, aiResponding, apiLimitReached, id]);

    useEffect(() => {
        if (courseSchedule) {
            let total = 0;
            courseSchedule.weeks.forEach(week => {
                week.days.forEach(day => {
                    day.timeSlots.forEach(timeSlot => {
                        timeSlot.contents.forEach(content => {
                            if (content.todo) {
                                total += content.todo.length;
                            }
                        });
                    });
                });
            });
            setTotalItems(total);
        }
    }, [courseSchedule]);

    useEffect(() => {
        if (totalItems > 0 && completedItems.size === totalItems && !allCompleted) {
            setAllCompleted(true);
            setIsModalOpen(true);
        } else if (completedItems.size < totalItems && allCompleted) {
            setAllCompleted(false);
        }
    }, [completedItems, totalItems, allCompleted]);

    const toggleCompletion = async (weekNum, dayNum, time, contentId, index, id) => {
        const itemKey = `${id}-${weekNum}-${dayNum}-${time}-${contentId}-${index}`;

        try {
            const newSet = new Set(completedItems);
            if (newSet.has(itemKey)) {
                newSet.delete(itemKey);
            } else {
                newSet.add(itemKey);
            }

            setCompletedItems(newSet);

            // Convert Set to Array before sending to the backend
            await updateCompletion(id, Array.from(newSet));
            if (newSet.size === totalItems) {
                setAllCompleted(true);
                setIsModalOpen(true);
            } else {
                setAllCompleted(false);
            }
        } catch (error) {
            console.error('Error updating completion status:', error);
            toast.error('Failed to update completion status');
        }
    };

    const renderTimeSlot = (timeSlot, weekNum, dayNum) => (
        <div key={timeSlot.time} className="time-slot">
            <h4 className="time">{timeSlot.time} - {timeSlot.subtitle}</h4>
            <div className="content-items">
                {timeSlot.contents.map(content => (
                    <div key={content.id} className="content-item">
                        <div className="content-header">
                            {content.todo && content.todo.length > 0 && (
                                <div className="todo-list">
                                    {content.todo.map((todoItem, index) => {
                                        const isCompleted = completedItems.has(`${id}-${weekNum}-${dayNum}-${timeSlot.time}-${content.id}-${index}`);
                                        return (
                                            <div key={index} className={`todo-item-container ${isCompleted ? 'completed' : ''}`}>
                                                <div className="todo-item" style={{ width: "100%" }}>
                                                    <input
                                                        style={{ width: "130px" }}
                                                        type="checkbox"
                                                        onChange={() => toggleCompletion(weekNum, dayNum, timeSlot.time, content.id, index, id)}
                                                        checked={isCompleted}
                                                    />
                                                    <label style={{ width: "100%" }}>{todoItem}</label>
                                                </div>
                                                <div className="resources">
                                                    {content.resources && content.resources.filter(resource => resource.for === todoItem).map((resource, index) => (
                                                        <div key={resource.id} className="resource-item">
                                                            {(editingResource && editingResource.resourceId === resource.id && resource.for === editingResource.forItem) ? (
                                                                <>
                                                                    <select
                                                                        value={newResourceType}
                                                                        onChange={(e) => { setNewResourceType(e.target.value) }}
                                                                    >
                                                                        <option value="">Select type</option>
                                                                        <option value="video">Video</option>
                                                                        <option value="textual">Textual</option>
                                                                    </select>
                                                                    <button onClick={handleSaveResource}>
                                                                        <Check size={16} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => handleEditResource(weekNum, dayNum, timeSlot.time, content.id, resource.id, todoItem)}>
                                                                        <Edit size={16} />
                                                                    </button>
                                                                    
                                                                </>
                                                            )}<a style={{ marginLeft: "10px" }} href={resource.link} target="_blank" rel="noopener noreferrer">
                                                                        Resource {index + 1} - {resource.description}
                                                                    </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const updateApiUsage = (response) => {
        if (response && response.currentUsage && response.limit) {
            setApiUsage(prevUsage => ({
                ...prevUsage,
                currentUsage: response.currentUsage,
                limit: response.limit
            }));
        }
    };

    const handleApiError = (error) => {
        if (error.response && error.response.status === 429) {
            const { currentUsage, limit, tier } = error.response.data;
            setApiLimitReached(true);
            setApiUsage(prevUsage => ({
                ...prevUsage,
                currentUsage,
                limit,
                tier: tier || prevUsage.tier
            }));
            toast.error('API limit reached. Please upgrade your plan to continue.');
        } else {
            toast.error('Failed to send message. Please try again.');
        }
    };

    const handleUpgrade = () => {
        navigate('/upgrade');
    };

    const handleInputChange = (e) => {
        if (!apiLimitReached) {
            setInput(e.target.value);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!conversation) return <div>No conversation found.</div>;

    return (
        <div className="conversation fullPageHeight">
            <header>
                <Link to="/"><ArrowLeft size={24} /></Link>
                <h2>Learn {conversation.title} with us</h2>
            </header>

            {showForm ? (
                <>
                    <form onSubmit={handleFormSubmit} className="setup-form">
                        <select value={level} onChange={(e) => setLevel(e.target.value)} required>
                            <option value="">Select Level</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Elementary">Elementary</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                        </select>
                        <select value={duration} onChange={(e) => setDuration(e.target.value)} required>
                            <option value="">Select Duration</option>
                            <option value="1 week">1 week</option>
                            <option value="2 weeks">2 weeks</option>
                            <option value="3 weeks">3 weeks</option>
                            <option value="4 weeks">4 weeks</option>
                        </select>
                        <button type="submit" disabled={aiResponding}>
                            {aiResponding ? <LoadingSpinner /> : 'Generate Course Schedule'}
                        </button>
                    </form>
                    {aiResponding && (
                        <>
                            {level !== "Beginner" ? (
                                <LoadingQuiz topic={conversation.title} />
                            ) : (
                                <BubblePopperGame />
                            )}
                        </>
                    )}
                </>
            ) : (
                // <div className="course-schedule messages">
                <div>
                    {conversation.messages && conversation.messages.length > 0 && (
                        <>
                            {conversation.messages.map((message, index) => (
                                <div key={index} className={`message ${message.role}`}>
                                    {message.role === 'user' ? (
                                        <div className="course-info-banner">
                                            <p>{message.content}</p>
                                        </div>
                                    ) : (
                                        courseSchedule && (
                                            <>
                                                {courseSchedule.weeks.map(week => (
                                                    <div key={week.weekNumber} className="week-section">
                                                        <h3>Week {week.weekNumber}</h3>
                                                        {week.days.map(day => (
                                                            <div key={day.dayNumber} className="day-section">
                                                                <h4>Day {day.dayNumber} - {day.title}</h4>
                                                                {day.timeSlots.map(timeSlot =>
                                                                    renderTimeSlot(timeSlot, week.weekNumber, day.dayNumber)
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </>
                                        )
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                    {aiResponding && <div className="message ai">AI is thinking...</div>}
                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* <div className="input-area">
                <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={apiLimitReached ? "Upgrade plan to continue" : "Type your message..."}
                    disabled={aiResponding || apiLimitReached}
                />
                <button
                    onClick={apiLimitReached ? handleUpgrade : handleSendMessage}
                    disabled={aiResponding || (apiLimitReached ? false : !input.trim())}
                >
                    {aiResponding ? 'AI Responding...' : apiLimitReached ? 'Upgrade Plan' : 'Send'}
                </button>
            </div> */}

            <CompletionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Conversation;