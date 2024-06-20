## Composing functions

This is didactic comparison between [composable-functions](https://github.com/seasonedcc/composable-functions/), [Effect](https://github.com/effect-TS/effect), and Vanilla implementations of composability.

### Running the examples

First, clone the repository and install the dependencies:

```bash
git clone git@github.com:gustavoguichard/effect-cf-vanilla.git
cd effect-cf-vanilla/
bun install
```

Then, you can run all the examples with:

```bash
# For a successful result
npm run dev -- 123 10OFF
```

For a failed result you can change the arguments in any way.

**Running a single example**:

```bash
# For composable-functions
npm run dev:cf -- 123 10OFF
# For Effect
npm run dev:effect -- 123 10OFF
# For Vanilla
npm run dev:vanilla -- 123 10OFF
```
