import { useContext } from 'react';
import styles from './comparison.module.css'
import { ComparedTeamKeysContext, TargetPicklistContext } from '../picklists-context';

function ComparisonTab() {
    const targetPicklist = useContext(TargetPicklistContext);
    const comparedTeams = useContext(ComparedTeamKeysContext);

    return (
        <div className={styles.container}>
            {!targetPicklist.val &&
                <div className={styles.errorBox}>
                    Choose a picklist to get started
                </div>
            }
            {!targetPicklist.val || comparedTeams.val?.length == 0 &&
                <div className={styles.errorBox}>
                    Choose a team to see its stats
                </div>
            }
        </div>
    );
}

export default ComparisonTab;