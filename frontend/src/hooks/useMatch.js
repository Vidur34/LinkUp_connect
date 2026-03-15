import { useState, useCallback } from 'react';
import api from '../api/axios';

export function useMatch() {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSuggestions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/match/suggestions');
            setSuggestions(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch suggestions');
        } finally {
            setLoading(false);
        }
    }, []);

    const getMatchScore = useCallback(async (userId) => {
        const res = await api.get(`/match/score/${userId}`);
        return res.data.data;
    }, []);

    return { suggestions, loading, error, fetchSuggestions, getMatchScore };
}
