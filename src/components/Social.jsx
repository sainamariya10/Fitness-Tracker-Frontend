import React, { useState, useEffect } from 'react';
import API from '../api';

const Social = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [currentUserId, setCurrentUserId] = useState('');
  const [followingUsers, setFollowingUsers] = useState([]);

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
  }, []);

  // Fetch current user info
  const fetchCurrentUser = async () => {
    try {
      const response = await API.get('/user/profile');
      setCurrentUserId(response.data._id || response.data.id);
      setFollowingUsers(response.data.following || []);
    } catch (err) {
      console.log('Could not fetch user profile');
    }
  };

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await API.get('/social/posts');
      setPosts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load posts: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    try {
      const response = await API.post('/social/posts', { content: newPost });
      setPosts([response.data, ...posts]);
      setNewPost('');
      setSuccessMessage('Post created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to create post: ' + (err.response?.data?.message || err.message));
    }
  };

  // Like a post
  const handleLikePost = async (postId) => {
    try {
      const response = await API.post(`/social/posts/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? response.data : p));
    } catch (err) {
      setError('Failed to like post: ' + (err.response?.data?.message || err.message));
    }
  };

  // Add comment to post
  const handleAddComment = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      const response = await API.post(`/social/posts/${postId}/comment`, { text });
      setPosts(posts.map(p => p._id === postId ? response.data : p));
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      setSuccessMessage('Comment added!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      setError('Failed to add comment: ' + (err.response?.data?.message || err.message));
    }
  };

  // Delete a post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      await API.delete(`/social/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
      setSuccessMessage('Post deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete post: ' + (err.response?.data?.message || err.message));
      console.error('Error deleting post:', err);
    }
  };

  // Follow a user
  const handleFollowUser = async (userId) => {
    try {
      // Check if already following
      const isFollowing = followingUsers.includes(userId);
      
      if (isFollowing) {
        // Unfollow
        await API.post(`/social/users/${userId}/unfollow`);
        setFollowingUsers(followingUsers.filter(id => id !== userId));
        setSuccessMessage('Unfollowed user!');
      } else {
        // Follow
        await API.post(`/social/users/${userId}/follow`);
        setFollowingUsers([...followingUsers, userId]);
        setSuccessMessage('Followed user!');
      }
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      // If the above endpoints don't exist, try alternative endpoints
      try {
        const isFollowing = followingUsers.includes(userId);
        if (isFollowing) {
          await API.delete(`/social/follow/${userId}`);
          setFollowingUsers(followingUsers.filter(id => id !== userId));
          setSuccessMessage('Unfollowed user!');
        } else {
          await API.post(`/social/follow/${userId}`);
          setFollowingUsers([...followingUsers, userId]);
          setSuccessMessage('Followed user!');
        }
        setTimeout(() => setSuccessMessage(''), 2000);
      } catch (fallbackErr) {
        setError('Failed to follow/unfollow user. Please check backend endpoints.');
        console.error('Error following user:', fallbackErr);
      }
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💬 Fitness Community</h1>

      {error && <div style={styles.errorBox}>{error}</div>}
      {successMessage && <div style={styles.successBox}>{successMessage}</div>}

      {/* Create Post Section */}
      <div style={styles.createPostCard}>
        <h2 style={styles.cardTitle}>📝 Share Your Fitness Journey</h2>
        <form onSubmit={handleCreatePost} style={styles.form}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your workout success, motivation, or fitness tips..."
            style={styles.textarea}
            maxLength={500}
          />
          <div style={styles.formFooter}>
            <span style={styles.charCount}>{newPost.length}/500</span>
            <button type="submit" style={styles.postBtn}>✍️ Post</button>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div style={styles.feedContainer}>
        {loading ? (
          <p style={styles.loadingText}>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p style={styles.emptyText}>No posts yet. Be the first to share!</p>
        ) : (
          posts.map((post) => (
            <div key={post._id} style={styles.postCard}>
              {/* Post Header */}
              <div style={styles.postHeader}>
                <div style={styles.authorSection}>
                  <h3 style={styles.postAuthor}>👤 {post.userName}</h3>
                  {post.userId !== currentUserId && (
                    <button
                      onClick={() => handleFollowUser(post.userId)}
                      style={{
                        ...styles.followBtn,
                        backgroundColor: followingUsers.includes(post.userId) ? '#e74c3c' : '#3498db',
                      }}
                    >
                      {followingUsers.includes(post.userId) ? '✓ Following' : '+ Follow'}
                    </button>
                  )}
                </div>
                <div style={styles.headerRight}>
                  <span style={styles.postDate}>
                    {new Date(post.createdAt).toLocaleDateString()} {new Date(post.createdAt).toLocaleTimeString()}
                  </span>
                  {post.userId === currentUserId && (
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      style={styles.deleteBtn}
                      title="Delete post"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <p style={styles.postContent}>{post.content}</p>

              {/* Post Actions */}
              <div style={styles.postActions}>
                <button
                  onClick={() => handleLikePost(post._id)}
                  style={{
                    ...styles.actionBtn,
                    backgroundColor: post.likes?.includes(currentUserId) ? '#e74c3c' : '#ecf0f1'
                  }}
                >
                  ❤️ Like ({post.likes?.length || 0})
                </button>
                <button
                  onClick={() => toggleComments(post._id)}
                  style={styles.actionBtn}
                >
                  💬 Comments ({post.comments?.length || 0})
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments[post._id] && (
                <div style={styles.commentsSection}>
                  <div style={styles.commentsList}>
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment, idx) => (
                        <div key={idx} style={styles.commentItem}>
                          <strong style={styles.commentAuthor}>{comment.userName}:</strong>
                          <p style={styles.commentText}>{comment.text}</p>
                        </div>
                      ))
                    ) : (
                      <p style={styles.noCommentsText}>No comments yet. Be the first!</p>
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <div style={styles.addCommentForm}>
                    <input
                      type="text"
                      value={commentText[post._id] || ''}
                      onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                      placeholder="Add a comment..."
                      style={styles.commentInput}
                      maxLength={200}
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      style={styles.commentBtn}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div style={styles.refreshContainer}>
        <button onClick={fetchPosts} style={styles.refreshBtn}>
          🔄 Refresh Posts
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    maxWidth: '800px',
    margin: '0 auto',
  },

  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '30px',
    fontSize: '32px',
  },

  errorBox: {
    backgroundColor: '#ffebee',
    border: '2px solid #e74c3c',
    color: '#c0392b',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
  },

  successBox: {
    backgroundColor: '#e8f5e9',
    border: '2px solid #27ae60',
    color: '#1b5e20',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
  },

  createPostCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },

  cardTitle: {
    margin: '0 0 15px 0',
    color: '#2c3e50',
    fontSize: '18px',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  textarea: {
    padding: '15px',
    border: '2px solid #ecf0f1',
    borderRadius: '5px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    resize: 'vertical',
    minHeight: '100px',
    boxSizing: 'border-box',
  },

  formFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  charCount: {
    fontSize: '12px',
    color: '#7f8c8d',
  },

  postBtn: {
    padding: '12px 30px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },

  feedContainer: {
    marginBottom: '30px',
  },

  loadingText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: '16px',
  },

  emptyText: {
    textAlign: 'center',
    color: '#95a5a6',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    fontSize: '16px',
  },

  postCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    borderLeft: '4px solid #3498db',
  },

  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #ecf0f1',
  },

  authorSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },

  postAuthor: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '16px',
    fontWeight: 'bold',
  },

  followBtn: {
    padding: '8px 15px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
    whiteSpace: 'nowrap',
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },

  postDate: {
    fontSize: '12px',
    color: '#95a5a6',
    whiteSpace: 'nowrap',
  },

  deleteBtn: {
    backgroundColor: 'transparent',
    border: '2px solid #e74c3c',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '5px 10px',
    transition: 'background-color 0.3s',
  },

  postContent: {
    margin: '0 0 15px 0',
    color: '#2c3e50',
    fontSize: '14px',
    lineHeight: '1.6',
  },

  postActions: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },

  actionBtn: {
    padding: '8px 15px',
    border: '1px solid #bdc3c7',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
  },

  commentsSection: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '5px',
    marginTop: '15px',
  },

  commentsList: {
    marginBottom: '15px',
    maxHeight: '200px',
    overflowY: 'auto',
  },

  commentItem: {
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '10px',
    borderLeft: '3px solid #f39c12',
  },

  commentAuthor: {
    color: '#2c3e50',
    fontSize: '13px',
  },

  commentText: {
    margin: '5px 0 0 0',
    color: '#7f8c8d',
    fontSize: '13px',
  },

  noCommentsText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: '13px',
  },

  addCommentForm: {
    display: 'flex',
    gap: '10px',
  },

  commentInput: {
    flex: 1,
    padding: '10px',
    border: '1px solid #bdc3c7',
    borderRadius: '5px',
    fontSize: '13px',
    boxSizing: 'border-box',
  },

  commentBtn: {
    padding: '10px 20px',
    backgroundColor: '#f39c12',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },

  refreshContainer: {
    textAlign: 'center',
  },

  refreshBtn: {
    padding: '12px 30px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
};

export default Social;

