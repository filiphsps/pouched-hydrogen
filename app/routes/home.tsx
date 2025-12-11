import { redirect } from "react-router";

export async function loader() {
    return redirect("/");
}

export default function HomeRedirect() {
    return null;
}
