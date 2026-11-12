import { generateStreakLink } from '../src/utils/streakToken';

function main() {
  const args = process.argv.slice(2);
  const streakArg = args.find((a) => !a.startsWith('--') && !isNaN(Number(a)));
  const hasWin = args.some((a) => a === '--win' || a === 'win' || a === '-w');
  const hoursArg = args.find((a) => a.startsWith('--hours='));

  if (!streakArg) {
    console.log('\nUsage:');
    console.log('  npm run make-link <streak_number> [--win]');
    console.log('\nExamples:');
    console.log('  npm run make-link 15');
    console.log('  npm run make-link 15 --win\n');
    process.exit(1);
  }

  const streak = parseInt(streakArg, 10);
  const hours = hoursArg ? parseInt(hoursArg.split('=')[1], 10) : 48;

  const link = generateStreakLink(streak, hasWin, hours);

  console.log('\n⚡ Flashle Streak Restore Link Generated');
  console.log('=======================================');
  console.log(`Streak Count : ${streak}`);
  console.log(`Include Win  : ${hasWin ? 'Yes (today marked won)' : 'No'}`);
  console.log(`Expires In   : ${hours} hours`);
  console.log('---------------------------------------');
  console.log(link);
  console.log('=======================================\n');
}

main();
