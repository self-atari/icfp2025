def to_readable(x):
    return 'ABCD'[x]
input_ = '314454545341234505230142301432043143535345452020123451023403204110340102340430203043434214210153204403143010'
output = [ 0, 0, 2, 2, 2, 1, 1, 2, 2, 1, 0, 0, 0, 1, 3, 1, 2, 1, 2, 0, 0, 2, 1, 1, 2, 0, 2, 1, 1, 0, 3, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 2, 0, 2, 0, 2, 1, 0, 0, 0, 1, 0, 1, 2, 0, 0, 1, 0, 3, 1, 1, 0, 0, 2, 0, 0, 1, 0, 1, 2, 0, 0, 1, 1, 3, 1, 0, 2, 0, 2, 2, 0, 0, 0, 0, 3, 1, 1, 2, 1, 3, 1, 2, 0, 1, 3, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1 ]
output = [to_readable(x) for x in output]

n = len(input_)

assert(len(input_) + 1 == len(output))

# for i, each in enumerate(zip(input_, output)):
#     print( '- ', ' => '.join(each))
#     if i % 6 == 0:
#         print()

for i in range(n):
    if i % 6 == 0:
        print()
    start = output[i]
    end = output[i + 1]
    door = input_[i]
    print(f'{start}x{door} - {end}')
