import React, { useState, useRef, useEffect } from 'react';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { InstantSearch, connectSearchBox, connectStateResults } from 'react-instantsearch-dom';
import { Box, TextField, Paper, List, ListItem, ListItemText, Button, Popper } from '@mui/material';
import { styled } from '@mui/system';

interface SearchProps {
  cityName: string | null;
  onSubmit: (city: { lat?: number; lon?: number; name?: string }) => void;
}

const searchClient = algoliasearch('P1O884D4FU', 'a8ff75dbd1a9f9ff11141220a5884893');

const SearchForm = styled('form')({
  display: 'flex',
  justifyContent: 'center',
  width: '80%',
});

const SearchInput = styled(TextField)({
  width: '100%',
});

const Hit = ({ hit, onClick }: any) => (
  <ListItem component={Button} onClick={() => onClick(hit)}>
    <ListItemText primary={hit.name} />
  </ListItem>
);

const Search: React.FC<SearchProps> = ({ onSubmit }) => {
  const containerRef = useRef<HTMLInputElement>(null); 



  const CustomHits = connectStateResults(({ searchState, searchResults }: any) => {
    const noResults = searchResults?.hits.length === 0;

    return (
      <Popper
        open={Boolean(searchState.query && searchState.query.length > 0)} // Keep open as long as there's text
        anchorEl={containerRef.current} 
        disablePortal={true}
        sx={{
          marginTop: '100px', 
          width: '80%',
          zIndex: 2,
        }}
      >
        <Paper
          sx={{
            borderRadius: '4px',
            boxShadow: 3,
            backgroundColor: 'white',
            width: '100%',
          }}
        >
          <List>
            {noResults ? (
              <ListItem>
                <ListItemText primary="No results found" />
              </ListItem>
            ) : (
              searchResults?.hits.map((hit: any) => (
                <Hit
                  key={hit.objectID}
                  hit={hit}
                  onClick={() => onSubmit({ lat: hit.lat, lon: hit.lon, name: hit.name })}
                />
              ))
            )}
          </List>
        </Paper>
      </Popper>
    );
  });

  const CustomSearchBox = connectSearchBox(({ currentRefinement, refine }: any) => {
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      refine(e.currentTarget.value); 
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({ name: currentRefinement });
    };

    return (
      <SearchForm onSubmit={handleSubmit}>
        <SearchInput
          sx={{ backgroundColor: 'white', borderRadius: '4px' }}
          value={currentRefinement}
          onChange={handleSearchChange}
          variant="outlined"
          placeholder="Enter city name"
          inputRef={containerRef} 
        />
      </SearchForm>
    );
  });

  return (
    <Box width="100%" display="flex" justifyContent="center" sx={{ position: 'relative' }}>
      <InstantSearch indexName="citiesWeather" searchClient={searchClient}>
        <CustomSearchBox />
        <CustomHits />
      </InstantSearch>
    </Box>
  );
};

export default Search;
