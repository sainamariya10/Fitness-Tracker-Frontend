import React, { createContext, useContext, useState, useEffect } from "react";

const FitnessContext = createContext();

export const FitnessProvider = ({ children }) => {
  // Global Workout Entries Log History State
  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem("global_workout_logs");
    return saved ? JSON.parse(saved) : [];
  });

  // Global Diet Entries Log History State
  const [dietLogs, setDietLogs] = useState(() => {
    const saved = localStorage.getItem("global_diet_logs");
    return saved ? JSON.parse(saved) : [];
  });

  // Custom Active Weekly Calorie Burn Target Goal Value
  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    const savedGoal = localStorage.getItem("global_workout_weekly_goal");
    return savedGoal ? Number(savedGoal) : 2000;
  });

  // Automatically synchronize engine arrays out to localStorage layers
  useEffect(() => {
    localStorage.setItem("global_workout_logs", JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem("global_diet_logs", JSON.stringify(dietLogs));
  }, [dietLogs]);

  useEffect(() => {
    localStorage.setItem("global_workout_weekly_goal", weeklyGoal.toString());
  }, [weeklyGoal]);


  // Operational State Mutation Actions API
  // const addWorkout = (log) => setWorkouts((prev) => [{ ...log, id: Date.now() }, ...prev]);
  const addWorkout = async (log) => {
  try {
    const response = await API.post('/api/workouts', log);
    setWorkouts((prev) => [response.data, ...prev]);
  } catch (error) {
    console.error('Failed to add workout:', error);
  }
};
  const deleteWorkout = (id) => setWorkouts((prev) => prev.filter((item) => item.id !== id));
  const clearWorkouts = () => setWorkouts([]);

  const addDiet = (log) => setDietLogs((prev) => [{ ...log, id: Date.now() }, ...prev]);
  const deleteDiet = (id) => setDietLogs((prev) => prev.filter((item) => item.id !== id));
  const clearDiet = () => setDietLogs([]);

  // Live Comprehensive Aggregations Calculations Engine
  const totalBurned = workouts.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
  const totalEaten = dietLogs.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
  const netCalories = totalEaten - totalBurned;

  // Compile helper maps matching charts layout indexing specifications (Mon-Sun)
  const getWeeklyChronologicalArray = (dataset, keyField) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const values = [0, 0, 0, 0, 0, 0, 0];
    
    // In production, match entry.date strings to day indexes. 
    // Fallback: populate indexes mock distribution if list is short.
    dataset.forEach((item, index) => {
      const targetIdx = index % 7;
      values[targetIdx] += (Number(item[keyField]) || 0);
    });
    
    return { labels: days, data: values.map(v => v || 10) }; // avoid zero gaps
  };

  return (
    <FitnessContext.Provider value={{
      workouts, addWorkout, deleteWorkout, clearWorkouts,
      dietLogs, addDiet, deleteDiet, clearDiet,
      weeklyGoal, setWeeklyGoal,
      totalBurned, totalEaten, netCalories,
      getWeeklyChronologicalArray
    }}>
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => useContext(FitnessContext);
