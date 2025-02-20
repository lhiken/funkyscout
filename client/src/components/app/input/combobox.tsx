import {
   Combobox,
   ComboboxButton,
   ComboboxInput,
   ComboboxOption,
   ComboboxOptions,
   Field,
} from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./styles.module.css";

interface GenericComboboxProps<T> {
   selectedItem: T | null;
   onChange: (item: T | null) => void;
   items: T[];
   setQuery: (query: string) => void;
   displayValue: (item: T | null) => string;
   onFocus?: () => void;
   label?: string;
   active: boolean;
}

export default function GenericCombobox<T>({
   selectedItem,
   onChange,
   items,
   setQuery,
   displayValue,
   onFocus,
   label = "Select",
   active,
}: GenericComboboxProps<T>) {
   return (
      <Field
         className={`${styles.genericCombobox} ${!active && styles.disabled}`}
         disabled={!active}
      >
         <Combobox value={selectedItem} onChange={onChange}>
            {({ open }) => (
               <>
                  <ComboboxButton>
                     <i className="fa-solid fa-chevron-down" />
                  </ComboboxButton>
                  <ComboboxInput
                     aria-label={label}
                     placeholder={label}
                     autoComplete="off"
                     className={styles.comboboxInput}
                     onChange={(event) => setQuery(event.target.value)}
                     displayValue={displayValue}
                     onFocus={onFocus}
                  />
                  <AnimatePresence>
                     {open && (
                        <ComboboxOptions
                           static
                           as={motion.div}
                           initial={{ opacity: 0, y: -20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -20 }}
                           style={{ maxHeight: "12rem" }}
                           anchor={{ to: "top", gap: "0.8rem" }}
                           className={styles.comboboxDropdownContainer}
                        >
                           <div className={styles.comboboxDropdownHeader}>
                              {label}
                           </div>
                           <div className={styles.comboboxDropdownLine} />
                           {items.map((item, index) => (
                              <ComboboxOption
                                 key={index}
                                 value={item}
                                 className={styles.comboboxDropdownOption}
                              >
                                 {displayValue(item)}
                              </ComboboxOption>
                           ))}
                        </ComboboxOptions>
                     )}
                  </AnimatePresence>
               </>
            )}
         </Combobox>
      </Field>
   );
}
