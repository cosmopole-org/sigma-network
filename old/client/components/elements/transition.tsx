'use client'

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

const Transition = ({ children }: { children: ReactNode }) => {
    return (
        <motion.div
            animate={{ y: 0, opacity: 1 }}
            initial={{ y: 20, opacity: 0 }}
            transition={{ ease: 'easeInOut', duration: 0.75 }}
        >
            {children}
        </motion.div>
    );
};

export default Transition;
