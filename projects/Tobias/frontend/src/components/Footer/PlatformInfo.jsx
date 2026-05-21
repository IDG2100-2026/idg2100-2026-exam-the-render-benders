
export default function PlatformInfo(){
    // getting the current year to update automatically in the footer
    const currentYear = new Date().getFullYear();
    return (
        <>
            <p>Spanish Poker Dice © 2026 - {currentYear}</p>
        </>
    );
}