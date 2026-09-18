"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

const BookmarkContext = createContext({});

export function BookmarkProvider({ children }) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookmarks on mount or when user changes
  useEffect(() => {
    async function loadBookmarks() {
      if (!user) {
        setBookmarks([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBookmarks(data);
      }
      setLoading(false);
    }

    loadBookmarks();
  }, [user]);

  const addBookmark = async (bookmarkData) => {
    if (!user) {
      alert("Please log in to save bookmarks.");
      return false;
    }

    // Optimistic update
    const newBookmark = { 
      id: `temp-${Date.now()}`, 
      user_id: user.id,
      url: bookmarkData.url, 
      type: bookmarkData.type,
      card_data: bookmarkData,
      created_at: new Date().toISOString()
    };
    
    setBookmarks(prev => [newBookmark, ...prev]);

    const { data, error } = await supabase
      .from('bookmarks')
      .insert([{
        user_id: user.id,
        url: bookmarkData.url,
        type: bookmarkData.type,
        card_data: bookmarkData
      }])
      .select()
      .single();

    if (error) {
      console.error("Error adding bookmark:", error);
      // Revert optimistic update
      setBookmarks(prev => prev.filter(b => b.url !== bookmarkData.url));
      return false;
    } else {
      // Replace temp with real ID
      setBookmarks(prev => prev.map(b => b.url === bookmarkData.url ? data : b));
      return true;
    }
  };

  const removeBookmark = async (url) => {
    if (!user) return false;

    // Optimistic update
    const previousBookmarks = [...bookmarks];
    setBookmarks(prev => prev.filter(b => b.url !== url));

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('url', url);

    if (error) {
      console.error("Error removing bookmark:", error);
      setBookmarks(previousBookmarks);
      return false;
    }
    return true;
  };

  const isBookmarked = (url) => {
    if (!url) return false;
    return bookmarks.some(b => b.url === url);
  };

  const toggleBookmark = async (bookmarkData) => {
    if (isBookmarked(bookmarkData.url)) {
      return await removeBookmark(bookmarkData.url);
    } else {
      return await addBookmark(bookmarkData);
    }
  };

  return (
    <BookmarkContext.Provider value={{
      bookmarks,
      loading,
      addBookmark,
      removeBookmark,
      toggleBookmark,
      isBookmarked
    }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarkContext);
}
