import Link from "next/link"

// Shared footer: gives every page consistent breathing room at the
// bottom, and carries the small "About" link that used to live in the
// header nav.
function Footer() {
    return (
        <footer className="mt-16 phone:mt-10 pt-6 pb-12 phone:pb-16 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
                <Link href="https://github.com/CallmeHongmaybe/lingohelper">
                    <a className="hover:text-gray-600 underline-offset-2 hover:underline transition-colors duration-200">About this project</a>
                </Link>
            </p>
        </footer>
    )
}

export default Footer
