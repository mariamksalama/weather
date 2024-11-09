import React, { useState } from 'react';

interface SearchProps {
  cityName: string|null;
  onSubmit: (cityName: string) => void;
}

const Search: React.FC<SearchProps> = ({ cityName, onSubmit }) => {
  const [inputValue, setInputValue] = useState(cityName);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
   if(inputValue) onSubmit(inputValue);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue ?? ""}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter city name"
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default Search;