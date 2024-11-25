import React, { useEffect } from 'react';

const BackgroundShapes = () => {
    const numberOfShapes = 5;
    const pixelRange = [30,100];

    useEffect(() => {
        // Create random shapes
        const createShapes = () => {
            for (let i = 0; i < numberOfShapes; i++) {
                const shape = document.createElement("div");
                shape.classList.add("shape");

                const size = Math.random() * (100 - 30) + 30;
            }
        }
    })
}